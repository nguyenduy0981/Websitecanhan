"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side errors are already logged in src/lib/api-handler.ts. This
    // client-side log is a fallback so a rendering error isn't silently lost.
    console.error("[lovebox] route error", error);
  }, [error]);

  return (
    <main className="lb-fade-in-up flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="lb-breathe text-6xl" aria-hidden="true" style={{ animationDuration: "3.4s" }}>
        😵
      </span>
      <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
      <p role="alert" className="max-w-sm text-muted-foreground">
        Rất tiếc, đã có sự cố. Vui lòng thử lại.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="lb-btn rounded-md border border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-medium text-white shadow-sm hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="lb-btn rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Về trang chủ
        </Link>
      </div>
      <Link href="/register" className="lb-btn mt-1 text-sm underline underline-offset-2 opacity-70 hover:opacity-100">
        Hoặc tự tạo hộp quà mới
      </Link>
    </main>
  );
}
