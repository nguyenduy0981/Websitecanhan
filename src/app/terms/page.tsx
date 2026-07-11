import type { Metadata } from "next";
import Link from "next/link";
import { FREE_ACTIVE_DURATION_DAYS, VIP_ACTIVE_DURATION_DAYS } from "@/config/business-rules";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ — LoveBox",
  description: "Điều khoản sử dụng dịch vụ LoveBox.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm underline underline-offset-2">
        ← Về trang chủ
      </Link>
      <h1 className="mb-2 mt-4 text-2xl font-bold">Điều khoản dịch vụ</h1>
      <p className="mb-6 text-sm text-muted-foreground">Cập nhật lần cuối: 2026-07-11</p>

      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold">1. Dịch vụ LoveBox</h2>
          <p>
            LoveBox cho phép bạn tạo một hộp quà kỹ thuật số (lời nhắn, hình ảnh, giao diện, hiệu
            ứng) và chia sẻ bằng một đường link riêng cho người nhận. Bằng việc tạo tài khoản, bạn
            đồng ý với các điều khoản dưới đây.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">2. Tài khoản</h2>
          <p>
            Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình. Bạn phải cung cấp một email
            hợp lệ mà bạn có quyền truy cập.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">3. Thời hạn hiển thị quà</h2>
          <p>
            Quà ở gói miễn phí hiển thị được cho người nhận xem trong {FREE_ACTIVE_DURATION_DAYS}{" "}
            ngày kể từ khi xuất bản. Quà VIP hiển thị được {VIP_ACTIVE_DURATION_DAYS} ngày. Sau khi
            hết hạn, quà sẽ không còn xem được nữa; sau một thời gian khôi phục, nội dung và hình
            ảnh sẽ bị xóa vĩnh viễn khỏi hệ thống. LoveBox không lưu trữ nội dung quà vĩnh viễn.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Thanh toán VIP</h2>
          <p>
            Nâng cấp VIP được thanh toán qua PayOS (chuyển khoản VietQR). LoveBox không lưu trữ
            thông tin thẻ/tài khoản ngân hàng của bạn — việc xử lý thanh toán do PayOS thực hiện.
            VIP chỉ được kích hoạt sau khi giao dịch được xác nhận thành công.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">5. Nội dung do người dùng tạo</h2>
          <p>
            Bạn chịu trách nhiệm về nội dung (lời nhắn, hình ảnh) mà bạn đăng lên LoveBox. Không
            được đăng nội dung vi phạm pháp luật, xúc phạm, hoặc vi phạm quyền của người khác. Nội
            dung bị báo cáo có thể được xem xét và tạm ngưng nếu vi phạm.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">6. Đường link quà</h2>
          <p>
            Đường link quà không được liệt kê công khai (không xuất hiện trên công cụ tìm kiếm) và
            chỉ những ai có link mới xem được. Hãy chỉ chia sẻ link với người bạn thực sự muốn gửi
            quà.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">7. Thay đổi điều khoản</h2>
          <p>
            Điều khoản này có thể được cập nhật khi dịch vụ thay đổi. Phiên bản mới nhất luôn được
            đăng tại trang này.
          </p>
        </section>
      </div>
    </main>
  );
}
