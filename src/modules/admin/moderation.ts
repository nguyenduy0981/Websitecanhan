import type { Gift } from "@prisma/client";
import { ConflictError } from "@/lib/errors";
import { getGiftForAdmin, setGiftStatusForAdmin } from "@/modules/gifts";
import { writeAuditLog } from "./audit";

/**
 * Suspends a gift (moderation state, orthogonal to the normal
 * DRAFT→ACTIVE→EXPIRED→... lifecycle — see CLAUDE.md). Idempotent: a gift
 * that's already SUSPENDED is left as-is rather than treated as a
 * conflict, since two open reports on the same gift can both resolve to
 * "suspend" without either failing.
 */
export async function suspendGift(
  giftId: string,
  actorId: string,
  context: { reportId?: string; reason?: string } = {},
): Promise<Gift> {
  const gift = await getGiftForAdmin(giftId);
  if (gift.status === "SUSPENDED") {
    return gift;
  }

  const updated = await setGiftStatusForAdmin(giftId, {
    status: "SUSPENDED",
    prevStatus: gift.status,
    suspendedAt: new Date(),
  });

  await writeAuditLog(actorId, "GIFT_SUSPENDED", "Gift", giftId, {
    prevStatus: gift.status,
    ...context,
  });

  return updated;
}

/**
 * Restores a suspended gift to whatever status it held before suspension.
 * Not idempotent (unlike suspend) — calling this on a non-suspended gift
 * is a real error since there's nothing meaningful to restore.
 * Deliberately does not compensate activeExpiresAt for the time spent
 * suspended — server time stays the sole source of truth for expiration
 * (see CLAUDE.md: "Server time (DB now()) is authoritative for expiration").
 */
export async function unsuspendGift(giftId: string, actorId: string): Promise<Gift> {
  const gift = await getGiftForAdmin(giftId);
  if (gift.status !== "SUSPENDED") {
    throw new ConflictError("Gift is not currently suspended");
  }

  const restoredStatus = gift.prevStatus ?? "DRAFT";
  const updated = await setGiftStatusForAdmin(giftId, {
    status: restoredStatus,
    prevStatus: null,
    suspendedAt: null,
  });

  await writeAuditLog(actorId, "GIFT_UNSUSPENDED", "Gift", giftId, { restoredStatus });

  return updated;
}
