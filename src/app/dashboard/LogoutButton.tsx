"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { spinnerClass } from "@/lib/ui-classes";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="lb-btn inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {loading && <span className={spinnerClass} aria-hidden="true" />}
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
