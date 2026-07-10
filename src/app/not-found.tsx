import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="text-muted-foreground">Trang bạn tìm không tồn tại hoặc đã bị xoá.</p>
      <Link
        href="/"
        className="rounded-md border px-4 py-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Về trang chủ
      </Link>
    </main>
  );
}
