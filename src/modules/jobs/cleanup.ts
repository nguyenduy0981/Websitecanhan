import { prisma } from "@/lib/prisma";
import { ANALYTICS_RETENTION_DAYS } from "@/config/business-rules";
import { deleteMediaAsset } from "@/modules/media";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Gives the editor UI a day's grace before treating an upload as abandoned
// (e.g. mid-edit, about to be attached to a block).
const ORPHAN_MIN_AGE_MS = 1 * MS_PER_DAY;
const RATE_LIMIT_HIT_MAX_AGE_MS = 1 * MS_PER_DAY;

interface BlockContent {
  mediaAssetId?: string;
  items?: { mediaAssetId: string }[];
}

function referencedMediaIds(content: unknown): string[] {
  const c = content as BlockContent;
  if (c.mediaAssetId) return [c.mediaAssetId];
  if (c.items) return c.items.map((item) => item.mediaAssetId);
  return [];
}

/**
 * Deletes MediaAsset rows that were uploaded (and linked to a gift) but
 * never actually attached to any of that gift's blocks — e.g. the editor
 * tab closed mid-upload, or a block's image was later replaced without
 * releasing the old asset (a known gap noted in Milestone 6).
 */
export async function cleanupOrphanedMedia(now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - ORPHAN_MIN_AGE_MS);
  const candidates = await prisma.mediaAsset.findMany({
    where: { status: "READY", giftId: { not: null }, createdAt: { lt: cutoff } },
    select: { id: true, ownerId: true, giftId: true },
  });

  const referencedByGift = new Map<string, Set<string>>();
  let deleted = 0;

  for (const asset of candidates) {
    if (!asset.giftId) continue;

    let referenced = referencedByGift.get(asset.giftId);
    if (!referenced) {
      const blocks = await prisma.giftBlock.findMany({
        where: { giftId: asset.giftId },
        select: { content: true },
      });
      referenced = new Set(blocks.flatMap((block) => referencedMediaIds(block.content)));
      referencedByGift.set(asset.giftId, referenced);
    }

    if (!referenced.has(asset.id)) {
      await deleteMediaAsset(asset.id, asset.ownerId);
      deleted++;
    }
  }

  return deleted;
}

/** Trims analytics tables to the configured retention window — see CLAUDE.md Cost rules. */
export async function cleanupOldAnalytics(now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - ANALYTICS_RETENTION_DAYS * MS_PER_DAY);
  const [events, views] = await Promise.all([
    prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.giftView.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);
  return events.count + views.count;
}

/**
 * Bulk sweep for rate-limit hit rows the per-request opportunistic cleanup
 * (Milestone 2) never touches — e.g. a key that was hit once and never
 * again, so no later request ever triggers its own cleanup.
 */
export async function cleanupOldRateLimitHits(now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - RATE_LIMIT_HIT_MAX_AGE_MS);
  const result = await prisma.rateLimitHit.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return result.count;
}
