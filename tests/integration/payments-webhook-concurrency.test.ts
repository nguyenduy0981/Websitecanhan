import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDatabase, prisma } from "./db-helpers";

// The single highest-value integration test in this project: proves
// "activate exactly once" (CLAUDE.md P0 payment rule) holds under REAL
// concurrent database access, not a mocked, effectively-serial Prisma
// client. tests/unit/payments-service.test.ts already covers this
// scenario against a mock (`updateMany` returning `count: 0`) — that
// verifies the *code path*, but a mock can't prove Postgres's own
// row-level locking actually serializes two genuinely concurrent
// `updateMany` calls the way the code assumes. This test fires two real
// webhook deliveries at once and checks the database's own final state.
const providerMock = {
  payOSProvider: {
    name: "payos",
    createCheckout: vi.fn(),
    verifyAndParseWebhook: vi.fn(),
  },
};
vi.mock("@/modules/payments/providers/payos", () => providerMock);

const { handlePaymentWebhook } = await import("@/modules/payments/service");

beforeEach(async () => {
  await resetDatabase();
  vi.clearAllMocks();
});

describe("handlePaymentWebhook concurrency (real DB)", () => {
  it("activates exactly once when two webhook deliveries for the same payment race for real", async () => {
    const owner = await prisma.user.create({
      data: { email: `payer+${Date.now()}@example.com`, passwordHash: "irrelevant" },
    });
    const originalExpiry = new Date("2026-06-01T00:00:00.000Z");
    const gift = await prisma.gift.create({
      data: {
        ownerId: owner.id,
        slug: `slug-${Date.now()}`,
        title: "T",
        message: "M",
        status: "ACTIVE",
        tier: "FREE",
        activeExpiresAt: originalExpiry,
      },
    });
    const orderCode = `${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        userId: owner.id,
        giftId: gift.id,
        provider: "payos",
        orderCode,
        amount: 49000,
        currency: "VND",
        product: "VIP_15D",
        status: "PENDING",
      },
    });

    const verifiedEvent = {
      success: true,
      code: "00",
      orderCode: Number(orderCode),
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_concurrent_1",
      raw: {},
    };
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue(verifiedEvent);

    // Two genuinely concurrent deliveries — both racing to claim the same
    // payment row against the real database at the same time.
    await Promise.all([handlePaymentWebhook({}), handlePaymentWebhook({})]);

    const finalPayment = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(finalPayment.status).toBe("ACTIVATED");

    const finalGift = await prisma.gift.findUniqueOrThrow({ where: { id: gift.id } });
    expect(finalGift.tier).toBe("VIP");
    const daysAdded =
      (finalGift.activeExpiresAt!.getTime() - originalExpiry.getTime()) / (24 * 60 * 60 * 1000);
    // Exactly one +15-day extension was applied — not 30 (double-applied)
    // and not 0 (never applied).
    expect(daysAdded).toBe(15);
  });

  it("a genuinely duplicate later delivery (already ACTIVATED) is a real no-op", async () => {
    const owner = await prisma.user.create({
      data: { email: `payer2+${Date.now()}@example.com`, passwordHash: "irrelevant" },
    });
    const originalExpiry = new Date("2026-06-01T00:00:00.000Z");
    const gift = await prisma.gift.create({
      data: {
        ownerId: owner.id,
        slug: `slug2-${Date.now()}`,
        title: "T",
        message: "M",
        status: "ACTIVE",
        tier: "FREE",
        activeExpiresAt: originalExpiry,
      },
    });
    const orderCode = `${Date.now()}1`;
    await prisma.payment.create({
      data: {
        userId: owner.id,
        giftId: gift.id,
        provider: "payos",
        orderCode,
        amount: 49000,
        currency: "VND",
        product: "VIP_15D",
        status: "PENDING",
      },
    });

    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: Number(orderCode),
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_dup_1",
      raw: {},
    });

    await handlePaymentWebhook({});
    await handlePaymentWebhook({}); // real duplicate delivery, sequential this time

    const finalGift = await prisma.gift.findUniqueOrThrow({ where: { id: gift.id } });
    const daysAdded =
      (finalGift.activeExpiresAt!.getTime() - originalExpiry.getTime()) / (24 * 60 * 60 * 1000);
    expect(daysAdded).toBe(15);
  });
});
