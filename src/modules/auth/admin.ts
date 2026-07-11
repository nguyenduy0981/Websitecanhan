import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  suspendedAt: Date | null;
  createdAt: Date;
}

function toAdminUserSummary(user: User): AdminUserSummary {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    suspendedAt: user.suspendedAt,
    createdAt: user.createdAt,
  };
}

/** For SUPER_ADMIN use only — the route layer enforces RBAC before calling this. */
export async function listUsersForAdmin(): Promise<AdminUserSummary[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map(toAdminUserSummary);
}

/** Returns the previous role too, so the caller can write a meaningful audit log entry. */
export async function setUserRole(
  targetUserId: string,
  role: UserRole,
): Promise<{ user: AdminUserSummary; previousRole: UserRole }> {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    throw new NotFoundError("User not found");
  }

  const updated = await prisma.user.update({ where: { id: targetUserId }, data: { role } });
  return { user: toAdminUserSummary(updated), previousRole: target.role };
}
