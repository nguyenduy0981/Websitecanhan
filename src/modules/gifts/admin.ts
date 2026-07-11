import type { Gift, GiftBlock, GiftStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

/**
 * Bypasses the normal ownership check in authorization.ts — for trusted
 * admin/moderation use only. The route layer (RBAC-gated) is responsible
 * for making sure only MODERATOR+ ever reaches these.
 */
export async function getGiftForAdmin(giftId: string): Promise<Gift> {
  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) {
    throw new NotFoundError("Gift not found");
  }
  return gift;
}

export async function listBlocksForAdmin(giftId: string): Promise<GiftBlock[]> {
  return prisma.giftBlock.findMany({ where: { giftId }, orderBy: { position: "asc" } });
}

export interface AdminStatusUpdate {
  status: GiftStatus;
  prevStatus: GiftStatus | null;
  suspendedAt: Date | null;
}

/** Sets gift status directly, outside the normal editable-state rules — moderation only. */
export async function setGiftStatusForAdmin(giftId: string, data: AdminStatusUpdate): Promise<Gift> {
  return prisma.gift.update({
    where: { id: giftId },
    data: { ...data, statusChangedAt: new Date() },
  });
}

const ALL_STATUSES: readonly GiftStatus[] = [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "RECOVERY",
  "DELETION_PENDING",
  "DELETED",
  "SUSPENDED",
];

/** Gift counts broken down by status — for the admin monitoring overview. */
export async function countGiftsByStatus(): Promise<Record<GiftStatus, number>> {
  const grouped = await prisma.gift.groupBy({ by: ["status"], _count: { _all: true } });
  const counts = Object.fromEntries(ALL_STATUSES.map((status) => [status, 0])) as Record<
    GiftStatus,
    number
  >;
  for (const row of grouped) {
    counts[row.status] = row._count._all;
  }
  return counts;
}
