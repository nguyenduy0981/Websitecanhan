import type { GiftStatus } from "@prisma/client";

const LABELS: Record<GiftStatus, string> = {
  DRAFT: "Nháp",
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Đã hết hạn",
  RECOVERY: "Đang chờ khôi phục",
  DELETION_PENDING: "Sắp bị xóa",
  DELETED: "Đã xóa",
  SUSPENDED: "Bị tạm ngưng",
};

export function giftStatusLabel(status: GiftStatus): string {
  return LABELS[status];
}
