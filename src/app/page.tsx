import { cookies } from "next/headers";
import Link from "next/link";
import { getSessionUser } from "@/modules/auth";

export default async function HomePage() {
  const user = await getSessionUser(await cookies());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">LoveBox</h1>
      <p className="text-muted-foreground">
        Hộp quà kỹ thuật số cảm xúc — đang được xây dựng.
      </p>
      <Link
        href={user ? "/dashboard" : "/login"}
        className="rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {user ? "Vào Dashboard" : "Đăng nhập"}
      </Link>
      {!user && (
        <Link href="/register" className="text-sm underline underline-offset-2">
          Chưa có tài khoản? Đăng ký
        </Link>
      )}
    </main>
  );
}
