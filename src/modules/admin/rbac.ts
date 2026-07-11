import type { UserRole } from "@prisma/client";
import { ForbiddenError } from "@/lib/errors";
import type { PublicUser } from "@/modules/auth";

const ROLE_RANK: Record<UserRole, number> = {
  CREATOR: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(user: PublicUser, minRole: UserRole): boolean {
  return ROLE_RANK[user.role] >= ROLE_RANK[minRole];
}

/** Throws ForbiddenError (never NotFoundError) — RBAC failures should be explicit, unlike ownership checks. */
export function requireRole(user: PublicUser, minRole: UserRole): void {
  if (!hasRole(user, minRole)) {
    throw new ForbiddenError("You don't have permission to perform this action");
  }
}
