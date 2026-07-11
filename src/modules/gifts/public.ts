import type { Gift, GiftBlock, GiftStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/** Looks up a gift by its public, unguessable slug. No ownership check — this is the public viewer path. */
export async function getGiftBySlug(slug: string): Promise<Gift | null> {
  return prisma.gift.findUnique({ where: { slug } });
}

/** Blocks for the public viewer, once the caller has already decided the gift is visible. */
export async function listBlocksPublic(giftId: string): Promise<GiftBlock[]> {
  return prisma.giftBlock.findMany({ where: { giftId }, orderBy: { position: "asc" } });
}

export type ViewerDecision =
  | { type: "not_found" }
  | { type: "unavailable"; message: string }
  | { type: "active" };

/**
 * Pure status → viewer-behavior mapping, kept separate from any I/O so it's
 * unit-testable. A DRAFT gift is treated identically to "doesn't exist" —
 * unpublished content must never leak through the public link.
 */
export function classifyGiftForViewer(status: GiftStatus): ViewerDecision {
  switch (status) {
    case "DRAFT":
      return { type: "not_found" };
    case "ACTIVE":
      return { type: "active" };
    case "EXPIRED":
      return { type: "unavailable", message: "Món quà này đã hết hạn xem." };
    case "SUSPENDED":
      return { type: "unavailable", message: "Món quà này hiện không khả dụng." };
    case "RECOVERY":
    case "DELETION_PENDING":
    case "DELETED":
      return { type: "unavailable", message: "Món quà này không còn tồn tại." };
  }
}

/**
 * Records a page view for analytics. Never throws — a failure here must
 * never prevent the gift content itself from rendering (graceful
 * degradation, see CLAUDE.md / SPEC.md). No IP or other PII is stored.
 */
export async function recordGiftView(giftId: string, deviceClass?: string): Promise<void> {
  try {
    await prisma.giftView.create({ data: { giftId, deviceClass } });
  } catch (error) {
    logger.warn({ err: error, giftId }, "failed to record gift view (non-fatal)");
  }
}
