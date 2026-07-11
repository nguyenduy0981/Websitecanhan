import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/modules/auth";
import { listGiftsForOwner } from "@/modules/gifts";
import { hasRole } from "@/modules/admin";
import { StatusBadge } from "@/app/ui/StatusBadge";
import { ExpiryCountdown } from "@/app/ui/ExpiryCountdown";
import { LogoutButton } from "./LogoutButton";
import { CreateGiftForm } from "./CreateGiftForm";

export default async function DashboardPage() {
  const user = await getSessionUser(await cookies());
  if (!user) {
    redirect("/login");
  }

  const gifts = await listGiftsForOwner(user.id);

  return (
    <main className="lb-fade-in-up mx-auto max-w-2xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LoveBox</h1>
          <p className="text-sm text-muted-foreground">{user.displayName ?? user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasRole(user, "MODERATOR") && (
            <Link href="/admin/reports" className="text-sm underline">
              Quản trị
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="mb-6">
        <CreateGiftForm />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Quà của bạn</h2>
      {gifts.length === 0 ? (
        <div className="lb-fade-in-up flex flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center">
          <span className="text-4xl" aria-hidden="true">
            🎁
          </span>
          <p className="text-sm text-muted-foreground">Bạn chưa có quà nào. Hãy tạo quà đầu tiên!</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {gifts.map((gift, i) => (
            <li
              key={gift.id}
              className="lb-fade-in-up"
              style={{ "--lb-delay": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}
            >
              <Link
                href={`/gifts/${gift.id}`}
                className="lb-btn flex items-center justify-between rounded-md border p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <span className="font-medium">{gift.title}</span>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={gift.status} />
                  {gift.status === "ACTIVE" && gift.activeExpiresAt && (
                    <ExpiryCountdown expiresAt={gift.activeExpiresAt.toISOString()} />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
