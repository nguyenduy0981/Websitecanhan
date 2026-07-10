"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
const buttonClass =
  "mt-2 w-full rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        setError(data.error?.message ?? "Không thể đặt lại mật khẩu");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="rounded-md border p-3 text-sm">
        Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-500 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <label htmlFor="password" className="block text-sm font-medium">
        Mật khẩu mới (tối thiểu 8 ký tự)
      </label>
      <input
        id="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
      />

      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? "Đang lưu..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}
