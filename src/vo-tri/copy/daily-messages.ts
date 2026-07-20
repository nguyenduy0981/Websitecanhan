/**
 * One line that changes per day. Deterministic (day-of-year modulo pool
 * size), not random-per-render — everyone sees the same "today's" line,
 * and it's stable between server render and client hydration. Swapping
 * this for a real DB/API-backed daily message later only means changing
 * the body of `getDailyMessage`; every call site stays the same.
 */
const DAILY_MESSAGES = [
  "Hôm nay là một ngày tốt để không làm gì có ích.",
  "Cảnh báo: mức độ nghiêm túc trong này rất thấp.",
  "Bạn đã cười chưa? Chưa á? Để tính sau.",
  "Thử thách hôm nay: làm một việc vô nghĩa nhưng vui.",
  "Não bạn xứng đáng được nghỉ giải lao 5 phút.",
  "Ai đó ngoài kia đang làm điều ngớ ngẩn hơn bạn. Yên tâm.",
  "Hôm nay không có deadline nào ở đây cả.",
  "Mức độ vô tri hôm nay: đang tải...",
  "Chào bạn. Đúng giờ ghê, hay là trùng hợp?",
  "Một sự thật: cười nhảm cũng đốt calo.",
  "Hôm nay thích hợp để thử một trò gì đó mới.",
  "Không ai bắt bạn phải nghiêm túc ở đây.",
] as const;

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000);
}

export function getDailyMessage(date: Date = new Date()): string {
  const index = dayOfYear(date) % DAILY_MESSAGES.length;
  return DAILY_MESSAGES[index]!;
}
