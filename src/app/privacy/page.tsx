import type { Metadata } from "next";
import Link from "next/link";
import { ANALYTICS_RETENTION_DAYS } from "@/config/business-rules";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — LoveBox",
  description: "Chính sách bảo mật và dữ liệu của LoveBox.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm underline underline-offset-2">
        ← Về trang chủ
      </Link>
      <h1 className="mb-2 mt-4 text-2xl font-bold">Chính sách bảo mật</h1>
      <p className="mb-6 text-sm text-muted-foreground">Cập nhật lần cuối: 2026-07-11</p>

      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold">1. Dữ liệu chúng tôi thu thập</h2>
          <ul className="ml-5 list-disc">
            <li>Email và mật khẩu (mật khẩu được mã hóa một chiều, không lưu dạng chữ thường).</li>
            <li>Nội dung quà bạn tạo: tiêu đề, lời nhắn, hình ảnh, lựa chọn giao diện/hiệu ứng.</li>
            <li>
              Thống kê lượt xem quà (số lượt, loại thiết bị chung như điện thoại/máy tính) — không
              lưu địa chỉ IP hay thông tin định danh người xem.
            </li>
            <li>
              Thông tin giao dịch VIP (mã đơn hàng, số tiền) — không lưu số thẻ/tài khoản ngân hàng.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">2. Mục đích sử dụng</h2>
          <p>
            Dữ liệu trên chỉ được dùng để vận hành dịch vụ: hiển thị quà, xác thực đăng nhập, xử lý
            thanh toán VIP, xử lý báo cáo vi phạm nội dung, và cải thiện sản phẩm. LoveBox không bán
            dữ liệu cá nhân của bạn cho bên thứ ba.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">3. Bên thứ ba xử lý dữ liệu</h2>
          <ul className="ml-5 list-disc">
            <li>PayOS — xử lý thanh toán VIP.</li>
            <li>Cloudflare R2 — lưu trữ hình ảnh bạn tải lên.</li>
            <li>Resend — gửi email đặt lại mật khẩu.</li>
          </ul>
          <p className="mt-1">
            Các bên này chỉ nhận dữ liệu cần thiết để thực hiện đúng chức năng của họ.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Thời gian lưu trữ</h2>
          <p>
            Nội dung quà (kể cả hình ảnh) bị xóa vĩnh viễn sau khi quà hết hạn và qua giai đoạn khôi
            phục — xem thời hạn cụ thể tại{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Điều khoản dịch vụ
            </Link>
            . Dữ liệu thống kê lượt xem được giữ tối đa {ANALYTICS_RETENTION_DAYS} ngày rồi tự động
            xóa.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">5. Quyền của bạn</h2>
          <p>
            Bạn có thể xóa quà ở trạng thái nháp bất cứ lúc nào. Nếu muốn xóa tài khoản hoặc yêu cầu
            xóa dữ liệu cá nhân, vui lòng liên hệ qua email bạn đã dùng để đăng ký.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">6. Bảo mật</h2>
          <p>
            Mật khẩu được mã hóa bằng argon2id. Phiên đăng nhập dùng cookie HTTP-only, chỉ gửi qua
            kết nối bảo mật (HTTPS). Ảnh tải lên được kiểm tra định dạng thực tế trước khi lưu trữ.
          </p>
        </section>
      </div>
    </main>
  );
}
