import { describe, expect, it } from "vitest";
import { hasRole, requireRole } from "@/modules/admin/rbac";
import { ForbiddenError } from "@/lib/errors";
import type { PublicUser } from "@/modules/auth";

function fakeUser(role: PublicUser["role"]): PublicUser {
  return {
    id: "user_1",
    email: "u@example.com",
    displayName: null,
    role,
    emailVerified: false,
    createdAt: new Date(),
  };
}

describe("hasRole", () => {
  it("ranks roles CREATOR < MODERATOR < ADMIN < SUPER_ADMIN", () => {
    expect(hasRole(fakeUser("CREATOR"), "MODERATOR")).toBe(false);
    expect(hasRole(fakeUser("MODERATOR"), "MODERATOR")).toBe(true);
    expect(hasRole(fakeUser("ADMIN"), "MODERATOR")).toBe(true);
    expect(hasRole(fakeUser("SUPER_ADMIN"), "ADMIN")).toBe(true);
    expect(hasRole(fakeUser("MODERATOR"), "SUPER_ADMIN")).toBe(false);
  });

  it("a role satisfies its own minimum", () => {
    expect(hasRole(fakeUser("SUPER_ADMIN"), "SUPER_ADMIN")).toBe(true);
  });
});

describe("requireRole", () => {
  it("throws ForbiddenError for an insufficient role", () => {
    expect(() => requireRole(fakeUser("CREATOR"), "MODERATOR")).toThrow(ForbiddenError);
  });

  it("does not throw for a sufficient role", () => {
    expect(() => requireRole(fakeUser("ADMIN"), "MODERATOR")).not.toThrow();
  });
});
