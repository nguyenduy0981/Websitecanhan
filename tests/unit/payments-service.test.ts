import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

// Service-layer tests exercise the real security-critical control flow
// (signature-throws-never-activates, amount/currency verification,
// exactly-once activation under a simulated race) against a mocked Prisma
// client and a mocked PaymentProvider — no live Postgres or PayOS
// credentials are available in this environment. See prior milestones'
// test files for the same rationale.
const { prismaMock, providerMock } = vi.hoisted(() => ({
  prismaMock: {
    payment: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
    gift: { findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
  providerMock: {
    payOSProvider: {
      name: "payos",
      createCheckout: vi.fn(),
      verifyAndParseWebhook: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/analytics", () => ({ recordAnalyticsEvent: vi.fn() }));
vi.mock("@/modules/payments/providers/payos", () => providerMock);
vi.mock("@/modules/gifts", async () => {
  const actual = await vi.importActual<typeof import("@/modules/gifts")>("@/modules/gifts");
  return { ...actual, getGiftForOwner: vi.fn() };
});

const { createVipCheckout, handlePaymentWebhook } = await import("@/modules/payments/service");
const { getGiftForOwner } = await import("@/modules/gifts");
const { ConflictError } = await import("@/lib/errors");

const mockedGetGiftForOwner = vi.mocked(getGiftForOwner);

function fakeGift(overrides: Record<string, unknown> = {}) {
  return {
    id: "gift_1",
    ownerId: "user_1",
    status: "DRAFT",
    tier: "FREE",
    activeExpiresAt: null,
    ...overrides,
  };
}

function fakePayment(overrides: Record<string, unknown> = {}) {
  return {
    id: "payment_1",
    userId: "user_1",
    giftId: "gift_1",
    provider: "payos",
    orderCode: "1700000000123",
    amount: 49000,
    currency: "VND",
    product: "VIP_15D",
    status: "PENDING",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
    fn(prismaMock),
  );
});

describe("createVipCheckout", () => {
  it("rejects a gift that isn't DRAFT or ACTIVE", async () => {
    mockedGetGiftForOwner.mockResolvedValue(fakeGift({ status: "EXPIRED" }) as never);
    await expect(createVipCheckout("user_1", "gift_1")).rejects.toBeInstanceOf(ConflictError);
    expect(prismaMock.payment.create).not.toHaveBeenCalled();
  });

  it("creates a Payment and a checkout for the configured VIP price", async () => {
    mockedGetGiftForOwner.mockResolvedValue(fakeGift({ status: "DRAFT" }) as never);
    prismaMock.payment.create.mockResolvedValue(fakePayment());
    prismaMock.payment.update.mockResolvedValue({});
    providerMock.payOSProvider.createCheckout.mockResolvedValue({
      checkoutUrl: "https://pay.payos.vn/web/abc",
      qrCode: "00020101...",
      providerPaymentId: "link_abc",
    });

    const result = await createVipCheckout("user_1", "gift_1");

    expect(result.checkoutUrl).toBe("https://pay.payos.vn/web/abc");
    const createData = prismaMock.payment.create.mock.calls[0]![0].data;
    expect(createData.amount).toBe(49000);
    expect(createData.product).toBe("VIP_15D");
    expect(createData.status).toBe("CREATED");
    const checkoutInput = providerMock.payOSProvider.createCheckout.mock.calls[0]![0];
    expect(checkoutInput.amountVnd).toBe(49000);
  });

  it("retries with a fresh order code on a unique-constraint collision", async () => {
    mockedGetGiftForOwner.mockResolvedValue(fakeGift({ status: "DRAFT" }) as never);
    const collision = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "test",
    });
    prismaMock.payment.create.mockRejectedValueOnce(collision).mockResolvedValueOnce(fakePayment());
    prismaMock.payment.update.mockResolvedValue({});
    providerMock.payOSProvider.createCheckout.mockResolvedValue({
      checkoutUrl: "https://pay.payos.vn/web/abc",
      qrCode: "qr",
      providerPaymentId: "link_abc",
    });

    const result = await createVipCheckout("user_1", "gift_1");
    expect(result.checkoutUrl).toBe("https://pay.payos.vn/web/abc");
    expect(prismaMock.payment.create).toHaveBeenCalledTimes(2);
  });
});

describe("handlePaymentWebhook — security-critical paths", () => {
  it("never activates anything when the signature is invalid (provider throws)", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockRejectedValue(new Error("bad signature"));

    await expect(handlePaymentWebhook({ bogus: true })).rejects.toThrow("bad signature");
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("ignores a non-success webhook without touching any payment", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: false,
      code: "01",
      orderCode: 123,
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: {},
    });

    await handlePaymentWebhook({});
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("ignores a webhook for an orderCode with no matching payment", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 999,
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: {},
    });
    prismaMock.payment.findUnique.mockResolvedValue(null);

    await handlePaymentWebhook({});
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("is idempotent: a webhook for an already-ACTIVATED payment does nothing", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 123,
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: {},
    });
    prismaMock.payment.findUnique.mockResolvedValue(fakePayment({ status: "ACTIVATED" }));

    await handlePaymentWebhook({});
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects and never activates on an amount mismatch", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 123,
      amountVnd: 1, // attacker/underpayment: far less than the real 49000
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: { fake: true },
    });
    prismaMock.payment.findUnique.mockResolvedValue(fakePayment());
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });

    await handlePaymentWebhook({});

    expect(prismaMock.payment.updateMany).toHaveBeenCalledWith({
      where: { id: "payment_1", status: { notIn: ["ACTIVATED"] } },
      data: { status: "REJECTED", rawWebhook: { fake: true } },
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects and never activates on a currency mismatch", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 123,
      amountVnd: 49000,
      currency: "USD",
      providerTransactionId: "ref_1",
      raw: {},
    });
    prismaMock.payment.findUnique.mockResolvedValue(fakePayment());
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });

    await handlePaymentWebhook({});
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("activates VIP and extends expiry by exactly 15 days for an ACTIVE gift", async () => {
    const currentExpiry = new Date("2026-01-01T00:00:00.000Z");
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 123,
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: {},
    });
    prismaMock.payment.findUnique.mockResolvedValue(fakePayment());
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.gift.findUnique.mockResolvedValue(
      fakeGift({ status: "ACTIVE", activeExpiresAt: currentExpiry }),
    );
    prismaMock.gift.update.mockResolvedValue({});

    await handlePaymentWebhook({});

    const updateCall = prismaMock.gift.update.mock.calls[0]![0];
    expect(updateCall.data.tier).toBe("VIP");
    const diffDays =
      (updateCall.data.activeExpiresAt.getTime() - currentExpiry.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(15);
  });

  it("activates VIP for a DRAFT gift without inventing an expiry date", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 123,
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: {},
    });
    prismaMock.payment.findUnique.mockResolvedValue(fakePayment());
    prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "DRAFT", activeExpiresAt: null }));
    prismaMock.gift.update.mockResolvedValue({});

    await handlePaymentWebhook({});

    const updateCall = prismaMock.gift.update.mock.calls[0]![0];
    expect(updateCall.data.tier).toBe("VIP");
    expect(updateCall.data.activeExpiresAt).toBeNull();
  });

  it("activates exactly once: a concurrent duplicate delivery that loses the claim never touches the gift", async () => {
    providerMock.payOSProvider.verifyAndParseWebhook.mockResolvedValue({
      success: true,
      code: "00",
      orderCode: 123,
      amountVnd: 49000,
      currency: "VND",
      providerTransactionId: "ref_1",
      raw: {},
    });
    prismaMock.payment.findUnique.mockResolvedValue(fakePayment());
    // Simulates another concurrent delivery having already claimed it.
    prismaMock.payment.updateMany.mockResolvedValue({ count: 0 });

    await handlePaymentWebhook({});

    expect(prismaMock.gift.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.gift.update).not.toHaveBeenCalled();
  });
});
