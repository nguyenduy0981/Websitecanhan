"use client";

import { useState, type FormEvent } from "react";
import { inputClass } from "@/lib/ui-classes";
import { SubmitButton } from "@/app/ui/SubmitButton";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      // Always the same message, whether or not the account exists.
      setMessage(data.message ?? "Nếu tài khoản tồn tại, liên kết đặt lại mật khẩu đã được gửi.");
    } catch {
      setMessage("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <p role="status" className="lb-pop-in rounded-md border p-3 text-sm">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="lb-fade-in-up">
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />

      <SubmitButton
        submitting={submitting}
        label="Gửi liên kết đặt lại"
        submittingLabel="Đang gửi..."
        variant="primary"
      />
    </form>
  );
}
