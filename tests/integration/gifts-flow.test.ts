import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase, prisma } from "./db-helpers";

// Real Postgres — specifically targets what a mocked-Prisma unit test
// cannot: the real `@@unique([giftId, position])` constraint on
// GiftBlock. reorderBlocks (Milestone 3) uses a two-phase temp-offset
// update specifically to avoid tripping this constraint when swapping two
// blocks' positions; a naive single-pass update would throw here for
// real. This test proves the two-phase approach actually works against
// Postgres, not just that it issues the right mocked calls.
const { createGift, addBlock, publishGift, reorderBlocks } = await import("@/modules/gifts");

beforeEach(async () => {
  await resetDatabase();
});

async function createOwner() {
  return prisma.user.create({
    data: { email: `owner+${Date.now()}-${Math.random()}@example.com`, passwordHash: "irrelevant" },
  });
}

describe("gift creation + publish (real DB)", () => {
  it("creates a gift with a real unique slug and publishes with a real future activeExpiresAt", async () => {
    const owner = await createOwner();
    const gift = await createGift(owner.id, { title: "Chúc mừng", message: "Chúc bạn vui vẻ" });

    const bySlug = await prisma.gift.findUnique({ where: { slug: gift.slug } });
    expect(bySlug?.id).toBe(gift.id);

    await addBlock(gift.id, owner.id, { type: "TEXT", content: { text: "Nội dung" } });
    const published = await publishGift(gift.id, owner.id);

    expect(published.status).toBe("ACTIVE");
    expect(published.activeExpiresAt).not.toBeNull();
    const daysUntilExpiry =
      (published.activeExpiresAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    expect(daysUntilExpiry).toBeGreaterThan(2.9);
    expect(daysUntilExpiry).toBeLessThan(3.1);
  });
});

describe("reorderBlocks (real DB, real unique constraint)", () => {
  it("swaps two adjacent block positions without tripping @@unique([giftId, position])", async () => {
    const owner = await createOwner();
    const gift = await createGift(owner.id, { title: "T", message: "M" });
    const first = await addBlock(gift.id, owner.id, { type: "TEXT", content: { text: "first" } });
    const second = await addBlock(gift.id, owner.id, { type: "TEXT", content: { text: "second" } });
    expect(first.position).toBe(0);
    expect(second.position).toBe(1);

    const reordered = await reorderBlocks(gift.id, owner.id, {
      orderedBlockIds: [second.id, first.id],
    });

    expect(reordered.map((b) => b.id)).toEqual([second.id, first.id]);

    const rows = await prisma.giftBlock.findMany({
      where: { giftId: gift.id },
      orderBy: { position: "asc" },
    });
    expect(rows.map((r) => r.id)).toEqual([second.id, first.id]);
    // The real constraint held: no duplicate positions ever persisted.
    const positions = rows.map((r) => r.position);
    expect(new Set(positions).size).toBe(positions.length);
  });
});
