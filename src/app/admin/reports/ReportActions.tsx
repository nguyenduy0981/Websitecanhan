"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { spinnerClass } from "@/lib/ui-classes";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"DISMISS" | "SUSPEND" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resolve(action: "DISMISS" | "SUSPEND") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "Không thể xử lý báo cáo.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="lb-form-error mb-1 text-xs text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => resolve("SUSPEND")}
          disabled={loading !== null}
          className="lb-btn inline-flex items-center gap-1.5 rounded-md border border-red-500 px-3 py-1 text-xs font-medium text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading === "SUSPEND" && <span className={spinnerClass} aria-hidden="true" />}
          {loading === "SUSPEND" ? "Đang xử lý..." : "Tạm ngưng quà"}
        </button>
        <button
          type="button"
          onClick={() => resolve("DISMISS")}
          disabled={loading !== null}
          className="lb-btn inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading === "DISMISS" && <span className={spinnerClass} aria-hidden="true" />}
          {loading === "DISMISS" ? "Đang xử lý..." : "Bỏ qua"}
        </button>
      </div>
    </div>
  );
}
