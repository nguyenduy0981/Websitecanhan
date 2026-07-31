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

/**
 * One entry per error code a Postgres `security definer` RPC can raise
 * (see docs/BACKEND_ARCHITECTURE.md §6.2/§9.3) — the server layer
 * (`src/vo-tri/server/errors.ts`) maps the raw exception message to a key
 * here instead of ever showing raw SQL error text in a toast/dialog.
 * Unknown codes fall back to `errorCopy.generic`.
 */
export const serverErrorCopy = {
  NOT_AUTHENTICATED: {
    title: "Bạn chưa đăng nhập",
    description: "Đăng nhập rồi quay lại làm tiếp nhé.",
  },
  DAILY_LIMIT_EXCEEDED: {
    title: "Hôm nay chơi đủ rồi đó",
    description: "Trò này có giới hạn mỗi ngày — mai quay lại chơi tiếp nhé.",
  },
  COOLDOWN_ACTIVE: {
    title: "Chưa đến lượt đâu",
    description: "Trò này cần nghỉ một chút giữa các lần chơi. Thử lại sau nhé.",
  },
  QUEST_NOT_COMPLETE: {
    title: "Chưa xong nhiệm vụ này đâu",
    description: "Hoàn thành đủ điều kiện rồi quay lại nhận thưởng nhé.",
  },
  QUEST_ALREADY_CLAIMED: {
    title: "Nhận rồi mà!",
    description: "Nhiệm vụ này bạn đã nhận thưởng trước đó rồi.",
  },
  MILESTONE_NOT_REACHED: {
    title: "Chưa tới cột mốc này đâu",
    description: "Cố thêm chút nữa, sắp chạm tới rồi.",
  },
  MILESTONE_ALREADY_CLAIMED: {
    title: "Nhận rồi mà!",
    description: "Cột mốc này bạn đã nhận thưởng trước đó rồi.",
  },
  CANNOT_FOLLOW_SELF: {
    title: "Tự theo dõi chính mình á?",
    description: "Vô tri tới mức này thì thôi, chọn người khác đi.",
  },
  UNKNOWN_ACTIVITY: {
    title: "Không tìm thấy trò này",
    description: "Có thể nó vừa bị gỡ hoặc chưa từng tồn tại.",
  },
  UNKNOWN_QUEST: {
    title: "Không tìm thấy nhiệm vụ này",
    description: "Thử tải lại trang xem sao.",
  },
  UNKNOWN_MILESTONE: {
    title: "Không tìm thấy cột mốc này",
    description: "Thử tải lại trang xem sao.",
  },
  ALREADY_VOTED_TODAY: {
    title: "Hôm nay bạn chọn rồi mà",
    description: "Vô Tri Đồng Thuận chỉ cho chọn một lần mỗi ngày — mai quay lại nhé.",
  },
  UNKNOWN_DILEMMA: {
    title: "Không tìm thấy câu hỏi này",
    description: "Thử tải lại trang xem sao.",
  },
  CANNOT_CHALLENGE_SELF: {
    title: "Tự đưa mình ra Toà á?",
    description: "Vô tri tới mức này thì thôi, chọn người khác đi.",
  },
  UNKNOWN_TARGET: {
    title: "Không tìm thấy người này",
    description: "Có thể tài khoản này không còn tồn tại.",
  },
  UNKNOWN_TRIAL: {
    title: "Không tìm thấy phiên xử này",
    description: "Có thể nó đã bị gỡ hoặc chưa từng tồn tại.",
  },
  NOT_A_PARTY_TO_TRIAL: {
    title: "Phiên xử này không liên quan đến bạn",
    description: "Bạn không phải một trong hai bên của phiên xử này.",
  },
  TRIAL_ALREADY_RESOLVED: {
    title: "Toà đã tuyên án rồi",
    description: "Phiên xử này đã có kết quả, không thể trả lời lại.",
  },
  TRIAL_EXPIRED: {
    title: "Phiên xử đã hết hạn",
    description: "Không ai trả lời kịp trong thời gian cho phép.",
  },
  ALREADY_ANSWERED: {
    title: "Bạn trả lời rồi mà",
    description: "Chờ bên còn lại trả lời để Toà tuyên án nhé.",
  },
} satisfies Record<string, { title: string; description: string }>;

export type ServerErrorCode = keyof typeof serverErrorCopy;

export const successCopy = {
  generic: {
    title: "Xong xuôi!",
    description: "Mọi thứ đã được lưu lại, yên tâm đi.",
  },
  saved: { title: "Đã lưu, khỏi lo!" },
  copied: { title: "Đã sao chép!" },
  published: { title: "Lên sóng rồi đó!" },
};

export const authCopy = {
  signedIn: { title: "Chào mừng trở lại!" },
  signedUp: { title: "Tạo tài khoản thành công!" },
  // Shown instead of `signedUp` when the Supabase project requires email
  // confirmation (its own default) — `data.session` comes back empty in
  // that case, so the user is NOT actually logged in yet even though the
  // account now exists. Telling them anything else would be a silent lie.
  confirmEmailSent: {
    title: "Kiểm tra email để xác nhận nhé",
    description: "Bọn mình vừa gửi một đường link xác nhận. Bấm vào đó rồi quay lại đăng nhập nha.",
  },
};

// The Gameplay Engine's Result Pipeline — one entry per ResultKind so
// every Activity's win/lose/complete/timeout/abandoned screen pulls
// from the same five lines instead of each game inventing its own.
export const resultCopy = {
  win: { title: "Chiến thắng!", description: "Bạn vừa chơi một ván xuất sắc." },
  complete: { title: "Xong xuôi!", description: "Bạn vừa hoàn thành" },
  lose: { title: "Chưa thắng lần này", description: "Không sao, thử lại xem sao." },
  timeout: { title: "Hết giờ!", description: "Nhanh tay hơn ở lần sau nhé." },
  abandoned: { title: "Đã thoát", description: "Bạn đã rời khỏi giữa chừng." },
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
