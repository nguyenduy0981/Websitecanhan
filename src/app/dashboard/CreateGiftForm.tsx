"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
const buttonClass =
  "mt-2 rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

export function CreateGiftForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        setError(data.error?.message ?? "Không thể tạo quà");
        return;
      }

      router.push(`/gifts/${data.gift.id}`);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        + Tạo quà mới
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-md border p-4">
      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-500 p-3 text-sm text-red-600">
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
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Đang tạo..." : "Tạo quà"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 rounded-md px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
