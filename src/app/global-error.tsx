"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[lovebox] root layout error", error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <main className="lb-fade-in-up flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="lb-breathe text-6xl" aria-hidden="true" style={{ animationDuration: "3.4s" }}>
            😵
          </span>
          <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
          <p role="alert" className="max-w-sm text-muted-foreground">
            Rất tiếc, ứng dụng gặp sự cố. Vui lòng thử lại.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="lb-btn rounded-md border border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-medium text-white shadow-sm hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
