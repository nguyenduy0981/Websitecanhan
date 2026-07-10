import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/modules/auth";
import { listGiftsForOwner } from "@/modules/gifts";
import { giftStatusLabel } from "@/lib/gift-status-label";
import { LogoutButton } from "./LogoutButton";
import { CreateGiftForm } from "./CreateGiftForm";

export default async function DashboardPage() {
  const user = await getSessionUser(await cookies());
  if (!user) {
    redirect("/login");
  }

  const gifts = await listGiftsForOwner(user.id);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LoveBox</h1>
          <p className="text-sm text-muted-foreground">{user.displayName ?? user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <div className="mb-6">
        <CreateGiftForm />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Quà của bạn</h2>
      {gifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bạn chưa có quà nào. Hãy tạo quà đầu tiên!</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {gifts.map((gift) => (
            <li key={gift.id}>
              <Link
                href={`/gifts/${gift.id}`}
                className="flex items-center justify-between rounded-md border p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <span className="font-medium">{gift.title}</span>
                <span className="text-sm text-muted-foreground">{giftStatusLabel(gift.status)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
