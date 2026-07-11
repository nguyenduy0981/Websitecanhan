import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, mediaMock } = vi.hoisted(() => ({
  prismaMock: {
    mediaAsset: { findMany: vi.fn() },
    giftBlock: { findMany: vi.fn() },
    analyticsEvent: { deleteMany: vi.fn() },
    giftView: { deleteMany: vi.fn() },
    rateLimitHit: { deleteMany: vi.fn() },
  },
  mediaMock: { deleteMediaAsset: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/media", () => mediaMock);

const { cleanupOrphanedMedia, cleanupOldAnalytics, cleanupOldRateLimitHits } = await import(
  "@/modules/jobs/cleanup"
);

const NOW = new Date("2026-07-11T03:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cleanupOrphanedMedia", () => {
  it("deletes an asset that no block references, but keeps a referenced one", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([
      { id: "referenced", ownerId: "user_1", giftId: "gift_1" },
      { id: "orphaned", ownerId: "user_1", giftId: "gift_1" },
    ]);
    prismaMock.giftBlock.findMany.mockResolvedValue([
      { content: { mediaAssetId: "referenced" } },
    ]);

    const deletedCount = await cleanupOrphanedMedia(NOW);

    expect(deletedCount).toBe(1);
    expect(mediaMock.deleteMediaAsset).toHaveBeenCalledTimes(1);
    expect(mediaMock.deleteMediaAsset).toHaveBeenCalledWith("orphaned", "user_1");
  });

  it("recognizes assets referenced inside a GALLERY block's items array", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([
      { id: "in-gallery", ownerId: "user_1", giftId: "gift_1" },
    ]);
    prismaMock.giftBlock.findMany.mockResolvedValue([
      { content: { items: [{ mediaAssetId: "in-gallery" }] } },
    ]);

    const deletedCount = await cleanupOrphanedMedia(NOW);
    expect(deletedCount).toBe(0);
    expect(mediaMock.deleteMediaAsset).not.toHaveBeenCalled();
  });

  it("only considers assets older than the 1-day grace period", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([]);
    await cleanupOrphanedMedia(NOW);
    const call = prismaMock.mediaAsset.findMany.mock.calls[0]![0];
    const cutoff = call.where.createdAt.lt as Date;
    expect(NOW.getTime() - cutoff.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});

describe("cleanupOldAnalytics", () => {
  it("trims both AnalyticsEvent and GiftView older than the retention window", async () => {
    prismaMock.analyticsEvent.deleteMany.mockResolvedValue({ count: 5 });
    prismaMock.giftView.deleteMany.mockResolvedValue({ count: 3 });

    const total = await cleanupOldAnalytics(NOW);

    expect(total).toBe(8);
    const eventsCutoff = prismaMock.analyticsEvent.deleteMany.mock.calls[0]![0].where.createdAt.lt;
    const daysAgo = (NOW.getTime() - eventsCutoff.getTime()) / (24 * 60 * 60 * 1000);
    expect(daysAgo).toBe(90);
  });
});

describe("cleanupOldRateLimitHits", () => {
  it("deletes rows older than 1 day", async () => {
    prismaMock.rateLimitHit.deleteMany.mockResolvedValue({ count: 10 });
    const count = await cleanupOldRateLimitHits(NOW);
    expect(count).toBe(10);
  });
});
