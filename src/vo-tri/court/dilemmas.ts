import { dayOfYear } from "@/vo-tri/lib/date";
import type { Dilemma } from "./types";

/**
 * Real authored content (same status as Explore's activities.ts) —
 * mirrors supabase/migrations/20260724000014_court.sql's seed exactly as
 * of this writing. Feeds two consumption surfaces per
 * docs/VO_TRI_PRODUCT_BIBLE.md Part 1.3: Vô Tri Đồng Thuận's daily poll,
 * and Toà Án Vô Tri's trial content pool.
 */
export const dilemmas: Dilemma[] = [
  { id: "nhac-cho-vs-nhac-nen", prompt: "Đi ngủ mà không bật nhạc, hay nghe một bài lặp lại đến sáng?", optionA: "Im lặng tuyệt đối", optionB: "Một bài lặp mãi" },
  { id: "nhan-tin-truoc-vs-doi", prompt: 'Nhắn "đang làm gì đó" trước hay chờ người ta nhắn trước?', optionA: "Nhắn trước", optionB: "Chờ đến cùng" },
  { id: "an-com-nguoi-vs-mi-nong", prompt: "Cơm nguội ngon hơn hay mì gói lúc nửa đêm ngon hơn?", optionA: "Cơm nguội", optionB: "Mì gói nửa đêm" },
  { id: "xem-spoil-vs-khong", prompt: "Đọc spoil trước khi xem phim, hay thà chết cũng không đọc?", optionA: "Đọc trước cho chắc", optionB: "Thà chết không đọc" },
  { id: "bao-thuc-1-vs-10", prompt: "Đặt đúng 1 báo thức hay đặt 10 cái cách nhau 5 phút?", optionA: "Một cái, tin tưởng bản thân", optionB: "Mười cái, không tin ai cả" },
  { id: "goi-dien-vs-nhan-tin", prompt: "Có chuyện cần nói, gọi điện thẳng hay nhắn tin cả trang?", optionA: "Gọi luôn cho nhanh", optionB: "Nhắn tin cả trang" },
  { id: "to-vo-tri-vs-gia-nguy-hiem", prompt: 'Thà bị chê "vô tri" hay bị chê "nguy hiểm"?', optionA: "Vô tri thì được", optionB: "Nguy hiểm thì không" },
  { id: "xep-hang-vs-app", prompt: "Xếp hàng mua đồ ăn hay đặt app đợi ship dù đắt hơn?", optionA: "Xếp hàng tự đi", optionB: "Đặt app cho lành" },
  { id: "sua-loi-ban-vs-lam-ngo", prompt: "Bạn thân nói sai kiến thức trước mặt người khác, sửa ngay hay lờ đi?", optionA: "Sửa ngay tại chỗ", optionB: "Lờ đi, nói riêng sau" },
  { id: "ngu-nuong-vs-day-som", prompt: 'Được nghỉ, ngủ nướng đến trưa hay dậy sớm để "tận dụng ngày"?', optionA: "Ngủ nướng đã đời", optionB: "Dậy sớm cho đáng" },
  { id: "choi-chu-vs-choi-that", prompt: "Trò chơi thắng thua, chơi cho vui hay chơi để thắng bằng mọi giá?", optionA: "Chơi cho vui thôi", optionB: "Thắng mới về" },
  { id: "an-truoc-vs-an-sau", prompt: "Trên đĩa có món ngon nhất, ăn trước hay để dành ăn cuối?", optionA: "Ăn trước cho sướng", optionB: "Để dành ăn cuối" },
  { id: "reply-het-vs-reply-tuy-hung", prompt: "Tin nhắn, reply hết theo thứ tự hay reply theo cái nào thích trước?", optionA: "Theo thứ tự đàng hoàng", optionB: "Theo hứng, kệ thứ tự" },
  { id: "du-lich-lich-trinh-vs-tuy-hung", prompt: "Đi du lịch, lên lịch trình chi tiết hay đi tới đâu hay tới đó?", optionA: "Lịch trình rõ ràng", optionB: "Tới đâu hay tới đó" },
];

/** Day-seeded so "today's dilemma" is SSR/CSR-stable — same pattern as Explore's getFeaturedActivity / Retention's daily bonus quest. */
export function getDailyDilemma(date: Date = new Date()): Dilemma {
  return dilemmas[dayOfYear(date) % dilemmas.length]!;
}

export function getDilemmaById(id: string): Dilemma | undefined {
  return dilemmas.find((d) => d.id === id);
}
