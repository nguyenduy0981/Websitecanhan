import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { giftView: { create: vi.fn() } },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { recordGiftView } = await import("@/modules/gifts/public");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("recordGiftView", () => {
  it("records a view with the given device class", async () => {
    prismaMock.giftView.create.mockResolvedValue({});
    await recordGiftView("gift_1", "mobile");
    expect(prismaMock.giftView.create).toHaveBeenCalledWith({
      data: { giftId: "gift_1", deviceClass: "mobile" },
    });
  });

  it("never throws even if the write fails — must not take down the gift page", async () => {
    prismaMock.giftView.create.mockRejectedValue(new Error("connection lost"));
    await expect(recordGiftView("gift_1", "mobile")).resolves.toBeUndefined();
  });
});
