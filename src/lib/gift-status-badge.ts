import type { GiftStatus } from "@prisma/client";

export const GIFT_STATUS_BADGE_CLASS: Record<GiftStatus, string> = {
  DRAFT: "border-neutral-300 bg-neutral-100 text-neutral-700",
  ACTIVE: "border-green-300 bg-green-100 text-green-700",
  EXPIRED: "border-amber-300 bg-amber-100 text-amber-700",
  RECOVERY: "border-orange-300 bg-orange-100 text-orange-700",
  DELETION_PENDING: "border-red-300 bg-red-100 text-red-700",
  DELETED: "border-neutral-200 bg-neutral-100 text-neutral-400",
  SUSPENDED: "border-red-300 bg-red-100 text-red-700",
};
