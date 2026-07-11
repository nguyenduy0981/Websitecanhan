"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { errorTextClass } from "@/lib/ui-classes";
import { SubmitButton } from "@/app/ui/SubmitButton";
import { PasswordToggleInput } from "@/app/ui/PasswordToggleInput";
import { Checkmark } from "@/app/ui/Checkmark";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorNonce, setErrorNonce] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function showError(message: string) {
    setError(message);
    setErrorNonce((n) => n + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error?.message ?? "Không thể đặt lại mật khẩu");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      showError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="flex flex-col items-center gap-2 rounded-md border p-4 text-center text-sm">
        <Checkmark size={40} />
        Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="lb-fade-in-up">
      {error && (
        <p key={errorNonce} role="alert" className={errorTextClass}>
          {error}
        </p>
      )}

      <PasswordToggleInput
        id="password"
        label="Mật khẩu mới (tối thiểu 8 ký tự)"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={setPassword}
      />

      <SubmitButton
        submitting={submitting}
        label="Đặt lại mật khẩu"
        submittingLabel="Đang lưu..."
        variant="primary"
      />
    </form>
  );
}
