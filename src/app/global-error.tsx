"use client";

import { useEffect } from "react";

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
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
          <p role="alert" className="text-muted-foreground">
            Rất tiếc, ứng dụng gặp sự cố. Vui lòng thử lại.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
