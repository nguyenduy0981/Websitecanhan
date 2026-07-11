import { prisma } from "@/lib/prisma";
import { RECOVERY_DURATION_DAYS } from "@/config/business-rules";
import { deleteMediaAsset } from "@/modules/media";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** ACTIVE gifts whose activeExpiresAt has passed → EXPIRED. */
export async function expireActiveGifts(now: Date): Promise<number> {
  const result = await prisma.gift.updateMany({
    where: { status: "ACTIVE", activeExpiresAt: { lte: now } },
    data: { status: "EXPIRED", statusChangedAt: now, prevStatus: "ACTIVE" },
  });
  return result.count;
}

/**
 * Promotes gifts that were already EXPIRED *before this run started* into
 * RECOVERY, starting the recovery countdown now. The `statusChangedAt <
 * jobStartedAt` guard means a gift that only just became EXPIRED in
 * expireActiveGifts() above waits for the *next* cron run before entering
 * RECOVERY — so EXPIRED is a real, observable status for at least one
 * full cron interval rather than flipping within the same request.
 */
export async function promoteExpiredToRecovery(jobStartedAt: Date): Promise<number> {
  const result = await prisma.gift.updateMany({
    where: { status: "EXPIRED", statusChangedAt: { lt: jobStartedAt } },
    data: {
      status: "RECOVERY",
      recoveryEndsAt: new Date(jobStartedAt.getTime() + RECOVERY_DURATION_DAYS * MS_PER_DAY),
      statusChangedAt: jobStartedAt,
      prevStatus: "EXPIRED",
    },
  });
  return result.count;
}

/** RECOVERY gifts whose recoveryEndsAt has passed → DELETION_PENDING (queued, not yet purged). */
export async function promoteRecoveryToDeletionPending(now: Date): Promise<number> {
  const result = await prisma.gift.updateMany({
    where: { status: "RECOVERY", recoveryEndsAt: { lte: now } },
    data: { status: "DELETION_PENDING", statusChangedAt: now, prevStatus: "RECOVERY" },
  });
  return result.count;
}

/**
 * Actually deletes gift content — blocks, media (DB rows + R2 objects) —
 * and marks the gift DELETED. Only touches gifts that were already
 * DELETION_PENDING *before this run started*, giving one full cron
 * interval as a final, observable safety buffer before irreversible
 * deletion. See CLAUDE.md: "After Recovery ends: permanently delete gift
 * content AND all associated storage objects." The Gift row itself is
 * kept (not hard-deleted) so Payment/GiftView/AnalyticsEvent history
 * referencing it stays intact; only its content is wiped.
 */
export async function purgeDeletionPendingGifts(jobStartedAt: Date): Promise<number> {
  const gifts = await prisma.gift.findMany({
    where: { status: "DELETION_PENDING", statusChangedAt: { lt: jobStartedAt } },
    select: { id: true, ownerId: true },
  });

  for (const gift of gifts) {
    const assets = await prisma.mediaAsset.findMany({
      where: { giftId: gift.id },
      select: { id: true },
    });
    for (const asset of assets) {
      await deleteMediaAsset(asset.id, gift.ownerId);
    }

    await prisma.giftBlock.deleteMany({ where: { giftId: gift.id } });

    await prisma.gift.update({
      where: { id: gift.id },
      data: {
        status: "DELETED",
        deletedAt: jobStartedAt,
        statusChangedAt: jobStartedAt,
        prevStatus: "DELETION_PENDING",
        title: "",
        message: "",
        themeId: null,
        effectId: null,
        musicId: null,
      },
    });
  }

  return gifts.length;
}
