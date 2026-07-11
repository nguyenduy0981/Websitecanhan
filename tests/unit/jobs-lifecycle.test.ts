import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, mediaMock } = vi.hoisted(() => ({
  prismaMock: {
    gift: { updateMany: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    mediaAsset: { findMany: vi.fn() },
    giftBlock: { deleteMany: vi.fn() },
  },
  mediaMock: { deleteMediaAsset: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/media", () => mediaMock);

const {
  expireActiveGifts,
  promoteExpiredToRecovery,
  promoteRecoveryToDeletionPending,
  purgeDeletionPendingGifts,
} = await import("@/modules/jobs/lifecycle");

const NOW = new Date("2026-07-11T03:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("expireActiveGifts", () => {
  it("moves ACTIVE gifts past their expiry into EXPIRED", async () => {
    prismaMock.gift.updateMany.mockResolvedValue({ count: 3 });
    const count = await expireActiveGifts(NOW);
    expect(count).toBe(3);
    expect(prismaMock.gift.updateMany).toHaveBeenCalledWith({
      where: { status: "ACTIVE", activeExpiresAt: { lte: NOW } },
      data: { status: "EXPIRED", statusChangedAt: NOW, prevStatus: "ACTIVE" },
    });
  });
});

describe("promoteExpiredToRecovery", () => {
  it("only promotes gifts that were EXPIRED before this run started", async () => {
    prismaMock.gift.updateMany.mockResolvedValue({ count: 2 });
    await promoteExpiredToRecovery(NOW);
    const call = prismaMock.gift.updateMany.mock.calls[0]![0];
    expect(call.where).toEqual({ status: "EXPIRED", statusChangedAt: { lt: NOW } });
  });

  it("sets recoveryEndsAt exactly RECOVERY_DURATION_DAYS (7) out", async () => {
    prismaMock.gift.updateMany.mockResolvedValue({ count: 1 });
    await promoteExpiredToRecovery(NOW);
    const call = prismaMock.gift.updateMany.mock.calls[0]![0];
    const diffDays =
      (call.data.recoveryEndsAt.getTime() - NOW.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(7);
    expect(call.data.status).toBe("RECOVERY");
  });
});

describe("promoteRecoveryToDeletionPending", () => {
  it("moves RECOVERY gifts past recoveryEndsAt into DELETION_PENDING", async () => {
    prismaMock.gift.updateMany.mockResolvedValue({ count: 1 });
    const count = await promoteRecoveryToDeletionPending(NOW);
    expect(count).toBe(1);
    expect(prismaMock.gift.updateMany).toHaveBeenCalledWith({
      where: { status: "RECOVERY", recoveryEndsAt: { lte: NOW } },
      data: { status: "DELETION_PENDING", statusChangedAt: NOW, prevStatus: "RECOVERY" },
    });
  });
});

describe("purgeDeletionPendingGifts", () => {
  it("only purges gifts that were DELETION_PENDING before this run started", async () => {
    prismaMock.gift.findMany.mockResolvedValue([]);
    await purgeDeletionPendingGifts(NOW);
    expect(prismaMock.gift.findMany).toHaveBeenCalledWith({
      where: { status: "DELETION_PENDING", statusChangedAt: { lt: NOW } },
      select: { id: true, ownerId: true },
    });
  });

  it("deletes every media asset, all blocks, and clears content — but keeps the Gift row", async () => {
    prismaMock.gift.findMany.mockResolvedValue([{ id: "gift_1", ownerId: "user_1" }]);
    prismaMock.mediaAsset.findMany.mockResolvedValue([{ id: "asset_1" }, { id: "asset_2" }]);
    prismaMock.giftBlock.deleteMany.mockResolvedValue({ count: 2 });
    prismaMock.gift.update.mockResolvedValue({});

    const count = await purgeDeletionPendingGifts(NOW);

    expect(count).toBe(1);
    expect(mediaMock.deleteMediaAsset).toHaveBeenCalledWith("asset_1", "user_1");
    expect(mediaMock.deleteMediaAsset).toHaveBeenCalledWith("asset_2", "user_1");
    expect(prismaMock.giftBlock.deleteMany).toHaveBeenCalledWith({ where: { giftId: "gift_1" } });

    const updateCall = prismaMock.gift.update.mock.calls[0]![0];
    expect(updateCall.where).toEqual({ id: "gift_1" });
    expect(updateCall.data.status).toBe("DELETED");
    expect(updateCall.data.title).toBe("");
    expect(updateCall.data.message).toBe("");
    expect(updateCall.data.deletedAt).toEqual(NOW);
  });
});
