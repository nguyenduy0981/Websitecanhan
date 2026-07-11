import { beforeEach, describe, expect, it, vi } from "vitest";

// changeUserRole is the only way to grant MODERATOR/ADMIN beyond the one
// SUPER_ADMIN_EMAIL-bootstrapped account, so it must record who changed
// what (audit log) and surface a real NotFoundError for a bad target id.
const { prismaMock, auditMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
  auditMock: {
    writeAuditLog: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/admin/audit", () => auditMock);

const { listUsersForAdmin, setUserRole } = await import("@/modules/auth/admin");
const { changeUserRole } = await import("@/modules/admin/users");
const { NotFoundError } = await import("@/lib/errors");

beforeEach(() => {
  vi.clearAllMocks();
  auditMock.writeAuditLog.mockResolvedValue(undefined);
});

describe("auth/admin: listUsersForAdmin + setUserRole", () => {
  it("lists users newest first, mapped to a summary shape", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "u1",
        email: "a@example.com",
        displayName: "A",
        role: "CREATOR",
        suspendedAt: null,
        createdAt: new Date(),
        passwordHash: "secret-should-not-leak",
      },
    ]);

    const users = await listUsersForAdmin();
    expect(users[0]).not.toHaveProperty("passwordHash");
    expect(users[0]!.role).toBe("CREATOR");
  });

  it("setUserRole throws NotFoundError for an unknown user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(setUserRole("nope", "ADMIN")).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("setUserRole updates the role and returns the previous one", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", role: "CREATOR" });
    prismaMock.user.update.mockResolvedValue({
      id: "u1",
      email: "a@example.com",
      displayName: null,
      role: "MODERATOR",
      suspendedAt: null,
      createdAt: new Date(),
    });

    const result = await setUserRole("u1", "MODERATOR");
    expect(result.previousRole).toBe("CREATOR");
    expect(result.user.role).toBe("MODERATOR");
  });
});

describe("admin/users: changeUserRole", () => {
  it("writes an audit log entry recording the role transition", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", role: "CREATOR" });
    prismaMock.user.update.mockResolvedValue({
      id: "u1",
      email: "a@example.com",
      displayName: null,
      role: "MODERATOR",
      suspendedAt: null,
      createdAt: new Date(),
    });

    await changeUserRole("u1", "MODERATOR", "super_admin_1");

    expect(auditMock.writeAuditLog).toHaveBeenCalledWith("super_admin_1", "USER_ROLE_CHANGED", "User", "u1", {
      fromRole: "CREATOR",
      toRole: "MODERATOR",
    });
  });
});
