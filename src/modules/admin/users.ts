import type { UserRole } from "@prisma/client";
import { listUsersForAdmin, setUserRole, type AdminUserSummary } from "@/modules/auth";
import { writeAuditLog } from "./audit";

export async function listUsers(): Promise<AdminUserSummary[]> {
  return listUsersForAdmin();
}

export async function changeUserRole(
  targetUserId: string,
  role: UserRole,
  actorId: string,
): Promise<AdminUserSummary> {
  const { user, previousRole } = await setUserRole(targetUserId, role);
  await writeAuditLog(actorId, "USER_ROLE_CHANGED", "User", targetUserId, {
    fromRole: previousRole,
    toRole: role,
  });
  return user;
}
