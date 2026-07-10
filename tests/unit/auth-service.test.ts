import { beforeEach, describe, expect, it, vi } from "vitest";

// Service-layer tests exercise real business logic (password hashing/
// verification, ordering of checks, error mapping) against a mocked Prisma
// client — there is no live Postgres available in this environment, so
// these are not a substitute for an integration test against real Neon,
// but they do verify the auth service's actual control flow rather than
// just its types.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    rateLimitHit: {
      count: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { hashPassword } = await import("@/modules/auth/password");
const {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
} = await import("@/modules/auth/service");
const { ConflictError, ForbiddenError, RateLimitedError, UnauthorizedError, ValidationError } =
  await import("@/lib/errors");

const META = { ip: "203.0.113.7", userAgent: "vitest" };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.rateLimitHit.count.mockResolvedValue(0);
  prismaMock.rateLimitHit.create.mockResolvedValue({});
  prismaMock.rateLimitHit.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
});

describe("registerUser", () => {
  it("hashes the password (never stores it in plaintext) and creates a session", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "user_1",
      email: data.email,
      passwordHash: data.passwordHash,
      displayName: data.displayName ?? null,
      role: "CREATOR",
      emailVerified: false,
      suspendedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    prismaMock.session.create.mockResolvedValue({});

    const result = await registerUser(
      { email: "new@example.com", password: "correct horse battery staple" },
      META,
    );

    expect(result.user.email).toBe("new@example.com");
    expect(result.sessionToken).toBeTypeOf("string");
    const createdData = prismaMock.user.create.mock.calls[0]![0].data;
    expect(createdData.passwordHash).not.toBe("correct horse battery staple");
    expect(createdData.passwordHash).toMatch(/^\$argon2id\$/);
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
  });

  it("rejects a duplicate email with ConflictError, without touching sessions", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing" });

    await expect(
      registerUser({ email: "dup@example.com", password: "correct horse battery staple" }, META),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it("stops at the rate limiter before ever querying for an existing user", async () => {
    prismaMock.rateLimitHit.count.mockResolvedValue(9999);

    await expect(
      registerUser({ email: "x@example.com", password: "correct horse battery staple" }, META),
    ).rejects.toBeInstanceOf(RateLimitedError);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  it("logs in with correct credentials", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      passwordHash,
      displayName: null,
      role: "CREATOR",
      emailVerified: false,
      suspendedAt: null,
      createdAt: new Date(),
    });
    prismaMock.session.create.mockResolvedValue({});

    const result = await loginUser(
      { email: "user@example.com", password: "correct horse battery staple" },
      META,
    );
    expect(result.user.id).toBe("user_1");
  });

  it("rejects an unknown email with a generic message (no user enumeration)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser({ email: "nobody@example.com", password: "whatever1" }, META),
    ).rejects.toMatchObject({ message: "Invalid email or password" });
  });

  it("rejects the wrong password with the same generic message", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      passwordHash,
      suspendedAt: null,
    });

    await expect(
      loginUser({ email: "user@example.com", password: "wrong password" }, META),
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: expect.any(Number),
    });
    await expect(
      loginUser({ email: "user@example.com", password: "wrong password" }, META),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("blocks a suspended account even with an unusable password hash", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "user@example.com",
      passwordHash: "irrelevant",
      suspendedAt: new Date(),
    });

    await expect(
      loginUser({ email: "user@example.com", password: "anything1" }, META),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });
});

describe("logoutUser", () => {
  it("deletes the session matching the hashed token", async () => {
    prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });
    await logoutUser("some-session-token");
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: expect.any(String) },
    });
  });
});

describe("requestPasswordReset", () => {
  it("creates a reset token for an existing user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user_1", email: "user@example.com" });
    prismaMock.passwordResetToken.create.mockResolvedValue({});

    await requestPasswordReset("user@example.com", { ip: META.ip });
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
  });

  it("silently no-ops for a non-existent user (no account enumeration)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      requestPasswordReset("nobody@example.com", { ip: META.ip }),
    ).resolves.toBeUndefined();
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  it("rejects an unknown token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
    await expect(resetPassword({ token: "bad", password: "new password 1" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("rejects an expired token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      tokenHash: "hash",
      userId: "user_1",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(
      resetPassword({ token: "expired", password: "new password 1" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects an already-used token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      tokenHash: "hash",
      userId: "user_1",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60),
    });
    await expect(
      resetPassword({ token: "used", password: "new password 1" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("updates the password and invalidates all sessions for a valid token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      tokenHash: "hash",
      userId: "user_1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60),
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.passwordResetToken.update.mockResolvedValue({});
    prismaMock.session.deleteMany.mockResolvedValue({ count: 2 });

    await resetPassword({ token: "valid-token", password: "brand new password" });

    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.passwordResetToken.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "user_1" } });
  });
});
