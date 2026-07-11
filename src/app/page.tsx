import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/modules/auth";
import { FREE_ACTIVE_DURATION_DAYS, VIP_ACTIVE_DURATION_DAYS } from "@/config/business-rules";

export const metadata: Metadata = {
  title: "LoveBox — Hộp quà kỹ thuật số cảm xúc",
  description:
    "Tạo một hộp quà kỹ thuật số riêng cho người thân yêu: lời nhắn, hình ảnh, giao diện và hiệu ứng — rồi gửi qua một đường link.",
};

const STEPS = [
  {
    title: "1. Tạo quà",
    body: "Viết lời nhắn, thêm ảnh, chọn giao diện và hiệu ứng bạn thích.",
  },
  {
    title: "2. Xem trước",
    body: "Xem quà sẽ trông như thế nào trước khi gửi đi.",
  },
  {
    title: "3. Chia sẻ",
    body: "Gửi đường link (hoặc mã QR) cho người nhận qua Zalo, Messenger, tin nhắn...",
  },
] as const;

export default async function HomePage() {
  const user = await getSessionUser(await cookies());

  return (
    <main className="flex min-h-screen flex-col items-center gap-16 p-8 pb-24 pt-16 text-center">
      <section className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">LoveBox</h1>
        <p className="max-w-md text-muted-foreground">
          Hộp quà kỹ thuật số cảm xúc — gửi yêu thương theo cách của bạn. Viết lời nhắn, thêm ảnh,
          chọn giao diện, rồi chia sẻ bằng một đường link.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="rounded-md border px-5 py-2.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {user ? "Vào Dashboard" : "Tạo hộp quà đầu tiên"}
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-md px-5 py-2.5 text-sm underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          )}
        </div>
      </section>

      <section className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-md border p-4">
            <h2 className="font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-md text-sm text-muted-foreground">
        <p>
          Quà miễn phí hiển thị trong {FREE_ACTIVE_DURATION_DAYS} ngày. Nâng cấp VIP để quà hiển
          thị {VIP_ACTIVE_DURATION_DAYS} ngày và có thêm nhiều lựa chọn giao diện/hiệu ứng.
        </p>
      </section>
    </main>
  );
}
