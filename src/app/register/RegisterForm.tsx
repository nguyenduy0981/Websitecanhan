"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inputClass, errorTextClass } from "@/lib/ui-classes";
import { SubmitButton } from "@/app/ui/SubmitButton";
import { PasswordToggleInput } from "@/app/ui/PasswordToggleInput";

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorNonce, setErrorNonce] = useState(0);
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName: displayName || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error?.message ?? "Đăng ký thất bại");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      showError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <p key={errorNonce} role="alert" className={errorTextClass}>
          {error}
        </p>
      )}

      <label htmlFor="displayName" className="block text-sm font-medium">
        Tên hiển thị (không bắt buộc)
      </label>
      <input
        id="displayName"
        type="text"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className={inputClass}
      />

      <label htmlFor="email" className="mt-4 block text-sm font-medium">
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

      <PasswordToggleInput
        id="password"
        label="Mật khẩu (tối thiểu 8 ký tự)"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={setPassword}
        className="mt-4"
      />

      <SubmitButton
        submitting={submitting}
        label="Tạo tài khoản"
        submittingLabel="Đang tạo tài khoản..."
        variant="primary"
      />
    </form>
  );
}
