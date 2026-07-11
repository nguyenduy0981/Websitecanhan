import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Regression/behavior tests for the SUPER_ADMIN_EMAIL bootstrap (Milestone
// 9): the only way the phone-only owner can ever obtain an admin role
// without raw DB access. Each test re-imports the auth service fresh
// (vi.resetModules) since env.ts computes `env` once at import time — see
// tests/unit/env-app-url.test.ts for the same pattern.
const BASE_ENV = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/lovebox_test",
  SESSION_SECRET: "test-only-session-secret-not-for-real-use-000",
  CRON_SECRET: "test-only-cron-secret-0000",
};
const ENV_KEYS = ["SUPER_ADMIN_EMAIL", ...Object.keys(BASE_ENV)] as const;
const originalValues = new Map<string, string | undefined>();

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    session: { create: vi.fn(), findUnique: vi.fn(), deleteMany: vi.fn() },
    rateLimitHit: { count: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  for (const key of ENV_KEYS) {
    originalValues.set(key, process.env[key]);
    delete process.env[key];
  }
  Object.assign(process.env, BASE_ENV);
  prismaMock.rateLimitHit.count.mockResolvedValue(0);
  prismaMock.rateLimitHit.create.mockResolvedValue({});
  prismaMock.rateLimitHit.deleteMany.mockResolvedValue({ count: 0 });
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const original = originalValues.get(key);
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
});

function fakeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user_1",
    email: "owner@example.com",
    passwordHash: "irrelevant",
    displayName: null,
    role: "CREATOR",
    emailVerified: false,
    suspendedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("SUPER_ADMIN bootstrap", () => {
  it("promotes a matching email to SUPER_ADMIN on register", async () => {
    process.env.SUPER_ADMIN_EMAIL = "owner@example.com";
    const { registerUser } = await import("@/modules/auth/service");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(fakeUser());
    prismaMock.user.update.mockResolvedValue(fakeUser({ role: "SUPER_ADMIN" }));
    prismaMock.session.create.mockResolvedValue({});

    const result = await registerUser(
      { email: "owner@example.com", password: "correct horse battery staple" },
      { ip: "1.2.3.4" },
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { role: "SUPER_ADMIN" },
    });
    expect(result.user.role).toBe("SUPER_ADMIN");
  });

  it("never touches role for a non-matching email", async () => {
    process.env.SUPER_ADMIN_EMAIL = "owner@example.com";
    const { registerUser } = await import("@/modules/auth/service");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(fakeUser({ email: "someone-else@example.com" }));
    prismaMock.session.create.mockResolvedValue({});

    await registerUser(
      { email: "someone-else@example.com", password: "correct horse battery staple" },
      { ip: "1.2.3.4" },
    );

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("is a no-op when SUPER_ADMIN_EMAIL is not configured", async () => {
    const { registerUser } = await import("@/modules/auth/service");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(fakeUser());
    prismaMock.session.create.mockResolvedValue({});

    await registerUser(
      { email: "owner@example.com", password: "correct horse battery staple" },
      { ip: "1.2.3.4" },
    );

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("promotes on login too, case-insensitively", async () => {
    process.env.SUPER_ADMIN_EMAIL = "Owner@Example.com";
    const { loginUser } = await import("@/modules/auth/service");
    const { hashPassword } = await import("@/modules/auth/password");
    const passwordHash = await hashPassword("correct horse battery staple");
    prismaMock.user.findUnique.mockResolvedValue(fakeUser({ passwordHash }));
    prismaMock.user.update.mockResolvedValue(fakeUser({ passwordHash, role: "SUPER_ADMIN" }));
    prismaMock.session.create.mockResolvedValue({});

    const result = await loginUser(
      { email: "owner@example.com", password: "correct horse battery staple" },
      { ip: "1.2.3.4" },
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { role: "SUPER_ADMIN" },
    });
    expect(result.user.role).toBe("SUPER_ADMIN");
  });

  it("self-heals on session fetch: re-promotes even if the account was demoted", async () => {
    process.env.SUPER_ADMIN_EMAIL = "owner@example.com";
    const { getSessionUser } = await import("@/modules/auth/service");
    prismaMock.session.findUnique.mockResolvedValue({
      id: "hash",
      userId: "user_1",
      expiresAt: new Date(Date.now() + 60_000),
      user: fakeUser({ role: "CREATOR" }),
    });
    prismaMock.user.update.mockResolvedValue(fakeUser({ role: "SUPER_ADMIN" }));

    const cookies = { get: () => ({ value: "some-token" }) };
    const result = await getSessionUser(cookies as never);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { role: "SUPER_ADMIN" },
    });
    expect(result?.role).toBe("SUPER_ADMIN");
  });

  it("skips the update entirely once already SUPER_ADMIN", async () => {
    process.env.SUPER_ADMIN_EMAIL = "owner@example.com";
    const { getSessionUser } = await import("@/modules/auth/service");
    prismaMock.session.findUnique.mockResolvedValue({
      id: "hash",
      userId: "user_1",
      expiresAt: new Date(Date.now() + 60_000),
      user: fakeUser({ role: "SUPER_ADMIN" }),
    });

    const cookies = { get: () => ({ value: "some-token" }) };
    await getSessionUser(cookies as never);

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
