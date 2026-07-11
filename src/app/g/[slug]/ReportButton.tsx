"use client";

import { useState, type FormEvent } from "react";
import { REPORT_REASON_LABELS as REASON_LABELS } from "@/lib/report-reason-label";

export function ReportButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("INAPPROPRIATE");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, reason, details: details || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "Không thể gửi báo cáo. Vui lòng thử lại.");
        return;
      }
      setDone(true);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-xs opacity-70">Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs underline opacity-60 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Báo cáo nội dung này
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-2 w-full max-w-xs rounded-md border p-3 text-left text-sm"
    >
      {error && (
        <p role="alert" className="mb-2 rounded-md border border-red-500 p-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <label htmlFor="report-reason" className="block text-xs font-medium">
        Lý do
      </label>
      <select
        id="report-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-1 w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {Object.entries(REASON_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label htmlFor="report-details" className="mt-2 block text-xs font-medium">
        Chi tiết (không bắt buộc)
      </label>
      <textarea
        id="report-details"
        rows={2}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        className="mt-1 w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md border px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {submitting ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
