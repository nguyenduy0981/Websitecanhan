import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/modules/auth";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const user = await getSessionUser(await cookies());
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-bold">Tạo tài khoản</h1>
      <RegisterForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="underline underline-offset-2">
          Đăng nhập
        </Link>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Bằng việc đăng ký, bạn đồng ý với{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Chính sách bảo mật
        </Link>
        .
      </p>
    </main>
  );
}
