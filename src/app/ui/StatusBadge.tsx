import type { GiftStatus } from "@prisma/client";
import { giftStatusLabel } from "@/lib/gift-status-label";
import { GIFT_STATUS_BADGE_CLASS } from "@/lib/gift-status-badge";

export function StatusBadge({ status }: { status: GiftStatus }) {
  return (
    <span
      key={status}
      className={`lb-scale-in inline-block rounded-full border px-2 py-0.5 text-xs font-medium transition-colors duration-150 ${GIFT_STATUS_BADGE_CLASS[status]}`}
    >
      {giftStatusLabel(status)}
    </span>
  );
}
