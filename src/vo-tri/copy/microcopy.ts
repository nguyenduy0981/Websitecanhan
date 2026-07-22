/**
 * Central Vietnamese microcopy for VÔ TRI. Every loading/empty/error/
 * success string in the product should come from here, not be
 * hand-written per screen — that's what keeps the "hài hước, thông minh,
 * châm biếm nhẹ" voice consistent instead of drifting file by file.
 *
 * Voice rules (see docs/VO_TRI_DESIGN_BIBLE.md § Copywriting for the
 * full guideline):
 *   - Never generic ("Submit", "Loading", "Success", "Hãy thử lại").
 *   - Always still unambiguous — a joke that obscures what happened is a
 *     bug, not a feature.
 *   - Never mocks the user, never toxic, never a joke *at* someone.
 *   - The product is always "talking to" the user, not just reporting state.
 */

// Rotate through these for full-screen/section loading — a single static
// string gets stale the tenth time someone sees it.
export const loadingMessages = [
  "Đang pha trò...",
  "Đợi tí nhé, sắp có trò hay...",
  "Đang gọi não bộ hệ thống dậy...",
  "Chờ hệ thống tỉnh ngủ...",
  "Đang nhào nặn vài điều vô tri...",
  "Suỵt... có gì đó thú vị sắp hiện ra...",
] as const;

// Short enough to sit inside a button without pushing its width around.
export const loadingMessagesShort = ["Chờ xíu...", "Đang nè...", "Sắp xong...", "Đợi chút..."] as const;

export function pickLoadingMessage(pool: readonly string[] = loadingMessages): string {
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export const emptyCopy = {
  generic: {
    title: "Trống trơn, chưa có gì ở đây cả",
    description: "Có gì đó vừa bay mất... hoặc chưa từng tồn tại. Thử tạo cái gì đó xem?",
  },
  noResults: {
    title: "Tìm hoài không ra",
    description: "Có lẽ nó đang trốn ở một vũ trụ song song khác. Thử từ khoá khác xem sao.",
  },
  noNotifications: {
    title: "Yên ắng quá...",
    description: "Đáng ngờ đấy. Nhưng thôi, tận hưởng sự yên bình đi.",
  },
};

export const errorCopy = {
  generic: {
    title: "Ơ, có gì đó vừa vỡ...",
    description: "Không phải lỗi của bạn đâu (chắc vậy). Thử lại xem sao.",
  },
  network: {
    title: "Mạng đang giận dỗi",
    description: "Kiểm tra kết nối rồi thử lại nhé.",
  },
  notFound: {
    title: "Trang này đi lạc rồi",
    description: "Có thể nó chưa từng tồn tại, hoặc đã vô tri bay mất đâu đó.",
  },
};

export const offlineCopy = {
  title: "Bạn đang offline",
  description: "Không thấy mạng đâu cả. Kết nối lại rồi VÔ TRI sẽ ở đây chờ bạn.",
};

export const retryCopy = {
  title: "Chưa xong được...",
  description: "Thử lại một lần nữa xem, đôi khi chỉ cần vậy thôi.",
};

export const permissionCopy = {
  title: "Chỗ này chưa mở cho bạn",
  description: "Có thể bạn cần đăng nhập, hoặc đây không phải khu vực dành cho bạn.",
};

export const maintenanceCopy = {
  title: "VÔ TRI đang được tân trang",
  description: "Bọn mình đang chỉnh sửa vài thứ phía sau hậu trường. Quay lại sau nhé.",
};

// Shared "this doesn't exist yet, and here's an honest reason" toast copy —
// used anywhere a real feature (auth, a not-yet-built activity, ...) is
// tapped before its backend exists, so the wording stays consistent
// instead of each call site inventing its own.
export const notReadyCopy = {
  comingSoon: { title: "Đang được xây dựng...", description: "Ghé lại sau nhé, sắp có rồi." },
  auth: {
    title: "Đăng nhập chưa có ở đây",
    description: "Bọn mình đang xây hệ thống tài khoản thật. Quay lại sau nhé.",
  },
};

export const successCopy = {
  generic: {
    title: "Xong xuôi!",
    description: "Mọi thứ đã được lưu lại, yên tâm đi.",
  },
  saved: { title: "Đã lưu, khỏi lo!" },
  copied: { title: "Đã sao chép!" },
  published: { title: "Lên sóng rồi đó!" },
};

// Default titles a <Toast variant="..."/> falls back to when the caller
// doesn't pass one — a caller can always override with a specific message.
export const toastDefaultTitle: Record<"success" | "danger" | "warning" | "info", string> = {
  success: "Ngon lành!",
  danger: "Toang rồi...",
  warning: "Khoan đã...",
  info: "Nhân tiện...",
};

// Action labels — never "Submit"/"OK"/generic "Hủy".
export const actionCopy = {
  confirm: "Chốt luôn",
  cancel: "Thôi, để sau",
  retry: "Thử lại xem",
  next: "Tiếp tục nào",
  back: "Quay lại",
  close: "Đóng lại",
};
