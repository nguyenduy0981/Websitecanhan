import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface GiftViewStats {
  total: number;
  last7Days: number;
  last30Days: number;
  byDevice: Record<string, number>;
}

/**
 * Aggregates GiftView rows for a single gift. Callers are responsible for
 * ownership checks (this module has no opinion on who's allowed to see
 * whose stats) — see the gift editor page, which calls getGiftForOwner
 * first, same pattern as the media module's cross-cutting checks.
 */
export async function getGiftViewStats(giftId: string): Promise<GiftViewStats> {
  const now = new Date();
  const since7d = new Date(now.getTime() - 7 * MS_PER_DAY);
  const since30d = new Date(now.getTime() - 30 * MS_PER_DAY);

  const [total, last7Days, last30Days, views] = await Promise.all([
    prisma.giftView.count({ where: { giftId } }),
    prisma.giftView.count({ where: { giftId, createdAt: { gte: since7d } } }),
    prisma.giftView.count({ where: { giftId, createdAt: { gte: since30d } } }),
    prisma.giftView.findMany({ where: { giftId }, select: { deviceClass: true } }),
  ]);

  const byDevice: Record<string, number> = {};
  for (const view of views) {
    const key = view.deviceClass ?? "unknown";
    byDevice[key] = (byDevice[key] ?? 0) + 1;
  }

  return { total, last7Days, last30Days, byDevice };
}

/**
 * Best-effort business-event recording (funnel/revenue signals like
 * gift_created, gift_published, vip_activated) — never throws, same
 * graceful-degradation pattern as recordGiftView and writeAuditLog. Rows
 * are pruned by the existing Milestone 7 analytics-retention cron job
 * (ANALYTICS_RETENTION_DAYS).
 */
export async function recordAnalyticsEvent(
  name: string,
  meta: { userId?: string; giftId?: string; props?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name,
        userId: meta.userId,
        giftId: meta.giftId,
        props: (meta.props ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.warn({ err: error, name }, "failed to record analytics event (non-fatal)");
  }
}
