import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDatabase, prisma } from "./db-helpers";

// Real Postgres, no mocked Prisma — exercises constraints and behavior a
// mocked-client unit test structurally cannot: the DB's own unique
// constraints, real session row lifecycle, and the actual multi-statement
// resetPassword transaction. See tests/unit/auth-service.test.ts for the
// equivalent fast, mocked-Prisma coverage of the same service's branch
// logic.
const capturedResetUrls: string[] = [];
vi.mock("@/modules/auth/email", () => ({
  sendPasswordResetEmail: vi.fn(async (_to: string, resetUrl: string) => {
    capturedResetUrls.push(resetUrl);
  }),
}));

const { registerUser, loginUser, getSessionUser, requestPasswordReset, resetPassword } =
  await import("@/modules/auth/service");
const { ConflictError } = await import("@/lib/errors");

const META = { ip: "203.0.113.50" };

function cookieReaderFor(token: string) {
  return { get: () => ({ value: token }) };
}

beforeEach(async () => {
  await resetDatabase();
  capturedResetUrls.length = 0;
});

describe("registerUser (real DB)", () => {
  it("stores a real user row with an argon2id hash, never the plaintext password", async () => {
    await registerUser({ email: "real-user@example.com", password: "correct horse battery staple" }, META);

    const row = await prisma.user.findUniqueOrThrow({ where: { email: "real-user@example.com" } });
    expect(row.passwordHash).toMatch(/^\$argon2id\$/);
    expect(row.passwordHash).not.toContain("correct horse battery staple");
    expect(row.role).toBe("CREATOR");
  });

  it("enforces the real DB unique constraint on email, not just an app-level check", async () => {
    await registerUser({ email: "dup@example.com", password: "correct horse battery staple" }, META);

    await expect(
      registerUser({ email: "dup@example.com", password: "another password entirely" }, META),
    ).rejects.toBeInstanceOf(ConflictError);

    const count = await prisma.user.count({ where: { email: "dup@example.com" } });
    expect(count).toBe(1);
  });
});

describe("session lifecycle (real DB)", () => {
  it("a session created at login is really persisted and resolvable via getSessionUser", async () => {
    await registerUser({ email: "session-user@example.com", password: "correct horse battery staple" }, META);
    const { sessionToken } = await loginUser(
      { email: "session-user@example.com", password: "correct horse battery staple" },
      META,
    );

    const user = await getSessionUser(cookieReaderFor(sessionToken));
    expect(user?.email).toBe("session-user@example.com");
  });

  it("an expired session (real row, real expiresAt in the past) is rejected", async () => {
    await registerUser({ email: "expired-user@example.com", password: "correct horse battery staple" }, META);
    const { sessionToken } = await loginUser(
      { email: "expired-user@example.com", password: "correct horse battery staple" },
      META,
    );

    await prisma.session.updateMany({
      where: {},
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const user = await getSessionUser(cookieReaderFor(sessionToken));
    expect(user).toBeNull();
  });
});

describe("resetPassword (real DB)", () => {
  it("invalidates every existing session for the user, not just the one that requested it", async () => {
    // registerUser itself creates a session (auto-login on register), so
    // this ends up with 3 real session rows: register + 2 explicit logins.
    const registered = await registerUser(
      { email: "reset-user@example.com", password: "old password here" },
      META,
    );
    const login1 = await loginUser({ email: "reset-user@example.com", password: "old password here" }, META);
    const login2 = await loginUser({ email: "reset-user@example.com", password: "old password here" }, META);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: "reset-user@example.com" } });
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(3);

    await requestPasswordReset("reset-user@example.com", { ip: META.ip });
    expect(capturedResetUrls).toHaveLength(1);
    const token = new URL(capturedResetUrls[0]!).searchParams.get("token")!;

    await resetPassword({ token, password: "brand new password here" });

    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await getSessionUser(cookieReaderFor(registered.sessionToken))).toBeNull();
    expect(await getSessionUser(cookieReaderFor(login1.sessionToken))).toBeNull();
    expect(await getSessionUser(cookieReaderFor(login2.sessionToken))).toBeNull();

    // The new password actually works; the old one no longer does.
    await expect(
      loginUser({ email: "reset-user@example.com", password: "old password here" }, META),
    ).rejects.toThrow();
    const relogin = await loginUser(
      { email: "reset-user@example.com", password: "brand new password here" },
      META,
    );
    expect(relogin.user.email).toBe("reset-user@example.com");
  });
});
