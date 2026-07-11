import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/modules/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser(await cookies());
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="lb-fade-in-up mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-bold">Đăng nhập</h1>
      <LoginForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="underline underline-offset-2">
          Đăng ký
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline underline-offset-2">
          Quên mật khẩu?
        </Link>
      </p>
    </main>
  );
}
