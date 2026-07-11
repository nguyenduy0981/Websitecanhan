import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex justify-center gap-4 p-6 text-xs text-muted-foreground">
      <Link href="/terms" className="underline underline-offset-2">
        Điều khoản dịch vụ
      </Link>
      <Link href="/privacy" className="underline underline-offset-2">
        Chính sách bảo mật
      </Link>
    </footer>
  );
}
