import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="lb-fade-in-up mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-bold">Đặt lại mật khẩu</h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p role="alert" className="lb-pop-in rounded-md border border-red-500 p-3 text-sm text-red-600">
          Thiếu mã đặt lại mật khẩu. Vui lòng dùng liên kết trong email.
        </p>
      )}
    </main>
  );
}
