import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/modules/auth";
import { hasRole, listUsers } from "@/modules/admin";
import { RoleSelect } from "./RoleSelect";

// The layout only guarantees MODERATOR+; user-role management is
// SUPER_ADMIN only, so it's checked again here.
export default async function AdminUsersPage() {
  const user = await getSessionUser(await cookies());
  if (!user || !hasRole(user, "SUPER_ADMIN")) {
    notFound();
  }

  const users = await listUsers();

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Người dùng ({users.length})</h2>
      <ul className="flex flex-col gap-2">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{u.displayName ?? u.email}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
              {u.suspendedAt && <p className="text-xs text-red-600">Tài khoản bị tạm ngưng</p>}
            </div>
            <RoleSelect userId={u.id} role={u.role} />
          </li>
        ))}
      </ul>
    </div>
  );
}
