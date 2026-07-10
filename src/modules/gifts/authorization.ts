import type { Gift, GiftStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";

const EDITABLE_STATUSES: readonly GiftStatus[] = ["DRAFT", "ACTIVE"];

/**
 * Fetches a gift and enforces ownership in one step. Returns the same
 * NotFoundError for "doesn't exist" and "exists but belongs to someone
 * else" — see CLAUDE.md: "Backend authorization for every private
 * resource (no IDOR)." Never let a caller distinguish the two cases.
 */
export async function getGiftForOwner(giftId: string, ownerId: string): Promise<Gift> {
  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift || gift.ownerId !== ownerId) {
    throw new NotFoundError("Gift not found");
  }
  return gift;
}

/** Throws if the gift is in a status that no longer accepts content edits. */
export function assertEditable(gift: Gift): void {
  if (!EDITABLE_STATUSES.includes(gift.status)) {
    throw new ConflictError(`Gift cannot be edited while in ${gift.status} status`);
  }
}
