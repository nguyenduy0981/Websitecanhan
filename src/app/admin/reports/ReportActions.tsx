"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => resolve("SUSPEND")}
          disabled={loading !== null}
          className="rounded-md border border-red-500 px-3 py-1 text-xs font-medium text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {loading === "SUSPEND" ? "Đang xử lý..." : "Tạm ngưng quà"}
        </button>
        <button
          type="button"
          onClick={() => resolve("DISMISS")}
          disabled={loading !== null}
          className="rounded-md border px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {loading === "DISMISS" ? "Đang xử lý..." : "Bỏ qua"}
        </button>
      </div>
    </div>
  );
}
