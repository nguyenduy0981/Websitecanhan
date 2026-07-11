import Link from "next/link";

export function UnavailableView({ message }: { message: string }) {
  return (
    <main className="lb-fade-in-up flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="lb-breathe text-6xl" aria-hidden="true" style={{ animationDuration: "3.4s" }}>
        📭
      </span>
      <h1 className="text-2xl font-bold">LoveBox</h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="lb-btn rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Về trang chủ
        </Link>
        <Link
          href="/register"
          className="lb-btn rounded-md border border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-medium text-white shadow-sm hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Tự tạo hộp quà
        </Link>
      </div>
    </main>
  );
}
