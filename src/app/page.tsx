import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/modules/auth";
import { countGiftsByStatus } from "@/modules/gifts";
import { FREE_ACTIVE_DURATION_DAYS, VIP_ACTIVE_DURATION_DAYS } from "@/config/business-rules";
import { SiteFooter } from "./SiteFooter";
import { ScrollReveal } from "./ScrollReveal";

// Only shown once there's a real number worth showing — an honest "0" or
// "2 hộp quà đã được tạo" undermines trust more than just omitting it.
const SOCIAL_PROOF_MIN_COUNT = 10;

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
  const giftsByStatus = await countGiftsByStatus();
  const totalGifts = Object.values(giftsByStatus).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center gap-16 p-8 pb-8 pt-16 text-center">
        <section className="flex flex-col items-center gap-4">
          <h1 className="lb-fade-in-up text-4xl font-bold">LoveBox</h1>
          <p
            className="lb-fade-in-up max-w-md text-muted-foreground"
            style={{ "--lb-delay": "80ms" } as React.CSSProperties}
          >
            Hộp quà kỹ thuật số cảm xúc — gửi yêu thương theo cách của bạn. Viết lời nhắn, thêm ảnh,
            chọn giao diện, rồi chia sẻ bằng một đường link.
          </p>
          <div
            className="lb-fade-in-up flex flex-wrap items-center justify-center gap-3"
            style={{ "--lb-delay": "160ms" } as React.CSSProperties}
          >
            <Link
              href={user ? "/dashboard" : "/register"}
              className="rounded-md border px-5 py-2.5 font-medium transition-transform duration-150 hover:scale-[1.04] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {user ? "Vào Dashboard" : "Tạo hộp quà đầu tiên"}
            </Link>
            {!user && (
              <Link
                href="/login"
                className="rounded-md px-5 py-2.5 text-sm underline underline-offset-2 transition-transform duration-150 hover:scale-[1.04] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Đã có tài khoản? Đăng nhập
              </Link>
            )}
          </div>
          {totalGifts >= SOCIAL_PROOF_MIN_COUNT && (
            <p
              className="lb-fade-in-up text-sm text-muted-foreground"
              style={{ "--lb-delay": "240ms" } as React.CSSProperties}
            >
              Đã có <span className="font-semibold">{totalGifts}</span> hộp quà được tạo trên
              LoveBox.
            </p>
          )}
        </section>

        <ScrollReveal>
          <section className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-md border p-4 transition-transform duration-200 hover:-translate-y-1"
              >
                <h2 className="font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="max-w-md text-sm text-muted-foreground">
            <p>
              Quà miễn phí hiển thị trong {FREE_ACTIVE_DURATION_DAYS} ngày. Nâng cấp VIP để quà
              hiển thị {VIP_ACTIVE_DURATION_DAYS} ngày và có thêm nhiều lựa chọn giao diện/hiệu
              ứng.
            </p>
          </section>
        </ScrollReveal>
      </main>
      <SiteFooter />
    </>
  );
}
