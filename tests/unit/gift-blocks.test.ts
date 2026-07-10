import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    gift: {
      findUnique: vi.fn(),
    },
    giftBlock: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { addBlock, updateBlock, deleteBlock, reorderBlocks } = await import(
  "@/modules/gifts/blocks"
);
const { ConflictError, NotFoundError, ValidationError } = await import("@/lib/errors");

function fakeGift(overrides: Record<string, unknown> = {}) {
  return {
    id: "gift_1",
    ownerId: "user_1",
    status: "DRAFT",
    tier: "FREE",
    ...overrides,
  };
}

function fakeBlock(overrides: Record<string, unknown> = {}) {
  return {
    id: "block_1",
    giftId: "gift_1",
    type: "TEXT",
    position: 0,
    content: { text: "hi" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
});

describe("addBlock", () => {
  it("appends the first block at position 0", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift());
    prismaMock.giftBlock.findFirst.mockResolvedValue(null);
    prismaMock.giftBlock.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => fakeBlock({ ...data }),
    );

    const block = await addBlock("gift_1", "user_1", { type: "TEXT", content: { text: "hi" } });
    expect(block.position).toBe(0);
  });

  it("appends after the last existing block", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift());
    prismaMock.giftBlock.findFirst.mockResolvedValue(fakeBlock({ position: 4 }));
    prismaMock.giftBlock.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => fakeBlock({ ...data }),
    );

    const block = await addBlock("gift_1", "user_1", { type: "TEXT", content: { text: "hi" } });
    expect(block.position).toBe(5);
  });

  it("refuses to add a block to a non-editable gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "EXPIRED" }));
    await expect(
      addBlock("gift_1", "user_1", { type: "TEXT", content: { text: "hi" } }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(prismaMock.giftBlock.create).not.toHaveBeenCalled();
  });
});

describe("updateBlock", () => {
  it("validates new content against the block's own type schema", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift());
    prismaMock.giftBlock.findUnique.mockResolvedValue(fakeBlock({ type: "TEXT" }));

    await expect(
      updateBlock("gift_1", "block_1", "user_1", { mediaAssetId: "wrong-shape" }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.giftBlock.update).not.toHaveBeenCalled();
  });

  it("accepts matching content and persists it", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift());
    prismaMock.giftBlock.findUnique.mockResolvedValue(fakeBlock({ type: "TEXT" }));
    prismaMock.giftBlock.update.mockResolvedValue(fakeBlock({ content: { text: "updated" } }));

    const block = await updateBlock("gift_1", "block_1", "user_1", { text: "updated" });
    expect(block.content).toEqual({ text: "updated" });
  });

  it("throws NotFoundError when the block belongs to a different gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ id: "gift_1" }));
    prismaMock.giftBlock.findUnique.mockResolvedValue(fakeBlock({ giftId: "some_other_gift" }));

    await expect(
      updateBlock("gift_1", "block_1", "user_1", { text: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deleteBlock", () => {
  it("refuses to delete a block on a non-editable gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "SUSPENDED" }));
    prismaMock.giftBlock.findUnique.mockResolvedValue(fakeBlock());

    await expect(deleteBlock("gift_1", "block_1", "user_1")).rejects.toBeInstanceOf(ConflictError);
    expect(prismaMock.giftBlock.delete).not.toHaveBeenCalled();
  });
});

describe("reorderBlocks", () => {
  it("rejects a payload that doesn't match the gift's existing block ids exactly", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift());
    prismaMock.giftBlock.findMany.mockResolvedValue([
      fakeBlock({ id: "a" }),
      fakeBlock({ id: "b" }),
    ]);

    await expect(
      reorderBlocks("gift_1", "user_1", { orderedBlockIds: ["a", "c"] }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("runs a two-phase transaction (temp offset, then final positions)", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift());
    prismaMock.giftBlock.findMany
      .mockResolvedValueOnce([fakeBlock({ id: "a" }), fakeBlock({ id: "b" })])
      .mockResolvedValueOnce([
        fakeBlock({ id: "b", position: 0 }),
        fakeBlock({ id: "a", position: 1 }),
      ]);
    prismaMock.giftBlock.update.mockResolvedValue({});

    const blocks = await reorderBlocks("gift_1", "user_1", { orderedBlockIds: ["b", "a"] });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    const ops = prismaMock.$transaction.mock.calls[0]![0];
    expect(ops).toHaveLength(4); // 2 blocks x 2 phases
    expect(blocks[0]!.id).toBe("b");
  });
});
