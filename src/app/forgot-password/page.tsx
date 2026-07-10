import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="mb-2 text-2xl font-bold">Quên mật khẩu</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu nếu tài khoản tồn tại.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-2">
          Quay lại đăng nhập
        </Link>
      </p>
    </main>
  );
}
