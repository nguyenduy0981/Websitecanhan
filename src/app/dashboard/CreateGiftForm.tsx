"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inputClass, errorTextClass } from "@/lib/ui-classes";
import { SubmitButton } from "@/app/ui/SubmitButton";

export function CreateGiftForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorNonce, setErrorNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function showError(msg: string) {
    setError(msg);
    setErrorNonce((n) => n + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error?.message ?? "Không thể tạo quà");
        return;
      }

      router.push(`/gifts/${data.gift.id}`);
    } catch {
      showError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lb-btn rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        + Tạo quà mới
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="lb-fade-in-up rounded-md border p-4">
      {error && (
        <p key={errorNonce} role="alert" className={errorTextClass}>
          {error}
        </p>
      )}

      <label htmlFor="title" className="block text-sm font-medium">
        Tiêu đề
      </label>
      <input
        id="title"
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputClass}
      />

      <label htmlFor="message" className="mt-4 block text-sm font-medium">
        Lời nhắn
      </label>
      <textarea
        id="message"
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={inputClass}
      />

      <div className="mt-2 flex gap-2">
        <SubmitButton
          submitting={submitting}
          label="Tạo quà"
          submittingLabel="Đang tạo..."
          variant="primary"
          className="mt-0 w-auto"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lb-btn mt-0 rounded-md px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
