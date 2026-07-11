import { beforeEach, describe, expect, it, vi } from "vitest";

// getGiftViewStats aggregates the existing GiftView rows (no new schema);
// recordAnalyticsEvent is best-effort, same graceful-degradation pattern
// as recordGiftView/writeAuditLog — a write failure must never propagate
// to the caller.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    giftView: { count: vi.fn(), findMany: vi.fn() },
    analyticsEvent: { create: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { getGiftViewStats, recordAnalyticsEvent } = await import("@/modules/analytics/stats");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getGiftViewStats", () => {
  it("aggregates total/7d/30d counts and a device breakdown", async () => {
    prismaMock.giftView.count.mockResolvedValueOnce(42); // total
    prismaMock.giftView.count.mockResolvedValueOnce(5); // 7d
    prismaMock.giftView.count.mockResolvedValueOnce(20); // 30d
    prismaMock.giftView.findMany.mockResolvedValue([
      { deviceClass: "mobile" },
      { deviceClass: "mobile" },
      { deviceClass: "desktop" },
      { deviceClass: null },
    ]);

    const stats = await getGiftViewStats("gift_1");

    expect(stats.total).toBe(42);
    expect(stats.last7Days).toBe(5);
    expect(stats.last30Days).toBe(20);
    expect(stats.byDevice).toEqual({ mobile: 2, desktop: 1, unknown: 1 });
  });

  it("returns an empty device breakdown for a gift with no views", async () => {
    prismaMock.giftView.count.mockResolvedValue(0);
    prismaMock.giftView.findMany.mockResolvedValue([]);

    const stats = await getGiftViewStats("gift_1");

    expect(stats.total).toBe(0);
    expect(stats.byDevice).toEqual({});
  });
});

describe("recordAnalyticsEvent", () => {
  it("writes the event with the given name/meta", async () => {
    prismaMock.analyticsEvent.create.mockResolvedValue({});

    await recordAnalyticsEvent("gift_published", {
      userId: "user_1",
      giftId: "gift_1",
      props: { tier: "FREE" },
    });

    expect(prismaMock.analyticsEvent.create).toHaveBeenCalledWith({
      data: { name: "gift_published", userId: "user_1", giftId: "gift_1", props: { tier: "FREE" } },
    });
  });

  it("never throws even if the write fails", async () => {
    prismaMock.analyticsEvent.create.mockRejectedValue(new Error("connection lost"));

    await expect(recordAnalyticsEvent("gift_created", { userId: "user_1" })).resolves.toBeUndefined();
  });
});
