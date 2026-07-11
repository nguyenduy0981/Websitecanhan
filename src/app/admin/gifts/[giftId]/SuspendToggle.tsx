"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SuspendToggle({ giftId, suspended }: { giftId: string; suspended: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gifts/${giftId}/${suspended ? "unsuspend" : "suspend"}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "Không thể thực hiện thao tác.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
          suspended ? "" : "border-red-500 text-red-600"
        }`}
      >
        {loading ? "Đang xử lý..." : suspended ? "Bỏ tạm ngưng" : "Tạm ngưng quà này"}
      </button>
    </div>
  );
}
