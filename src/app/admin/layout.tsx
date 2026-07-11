import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/modules/auth";
import { hasRole } from "@/modules/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser(await cookies());
  if (!user) {
    redirect("/login");
  }
  if (!hasRole(user, "MODERATOR")) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản trị LoveBox</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/reports" className="underline">
            Báo cáo
          </Link>
          {hasRole(user, "SUPER_ADMIN") && (
            <Link href="/admin/users" className="underline">
              Người dùng
            </Link>
          )}
          <Link href="/dashboard" className="underline">
            Về Dashboard
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
