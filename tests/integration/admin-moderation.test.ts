import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase, prisma } from "./db-helpers";

// Real Postgres — confirms suspend/unsuspend's prevStatus round-trip and
// the audit log write actually persist correctly, including restoring a
// status the lifecycle cron itself would have set (EXPIRED), not just
// ACTIVE. tests/unit/admin-moderation.test.ts covers the same branches
// against a mocked gifts module; this exercises the real Gift row.
const { suspendGift, unsuspendGift } = await import("@/modules/admin/moderation");

beforeEach(async () => {
  await resetDatabase();
});

async function createGiftDirect(status: "ACTIVE" | "EXPIRED" = "ACTIVE") {
  const owner = await prisma.user.create({
    data: { email: `mod+${Date.now()}-${Math.random()}@example.com`, passwordHash: "irrelevant" },
  });
  return prisma.gift.create({
    data: {
      ownerId: owner.id,
      slug: `slug-${Date.now()}-${Math.random()}`,
      title: "T",
      message: "M",
      status,
    },
  });
}

describe("suspendGift / unsuspendGift (real DB)", () => {
  it("suspends an ACTIVE gift and restores exactly that status on unsuspend", async () => {
    const gift = await createGiftDirect("ACTIVE");

    const suspended = await suspendGift(gift.id, "moderator_1", { reason: "reported" });
    expect(suspended.status).toBe("SUSPENDED");
    expect(suspended.prevStatus).toBe("ACTIVE");

    const auditRows = await prisma.auditLog.findMany({ where: { targetId: gift.id } });
    expect(auditRows).toHaveLength(1);
    expect(auditRows[0]!.action).toBe("GIFT_SUSPENDED");
    expect(auditRows[0]!.actorId).toBe("moderator_1");

    const restored = await unsuspendGift(gift.id, "moderator_1");
    expect(restored.status).toBe("ACTIVE");
    expect(restored.prevStatus).toBeNull();
    expect(restored.suspendedAt).toBeNull();
  });

  it("restores a gift the lifecycle cron had already moved to EXPIRED, not back to ACTIVE", async () => {
    const gift = await createGiftDirect("EXPIRED");

    await suspendGift(gift.id, "moderator_1");
    const restored = await unsuspendGift(gift.id, "moderator_1");

    expect(restored.status).toBe("EXPIRED");
  });

  it("suspending twice is idempotent against the real row (no error, no duplicate audit log)", async () => {
    const gift = await createGiftDirect("ACTIVE");

    await suspendGift(gift.id, "moderator_1");
    await suspendGift(gift.id, "moderator_1");

    const auditRows = await prisma.auditLog.findMany({ where: { targetId: gift.id } });
    expect(auditRows).toHaveLength(1);
  });
});
