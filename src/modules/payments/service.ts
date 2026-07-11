import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ConflictError } from "@/lib/errors";
import { env } from "@/env";
import { renewedVipExpiry } from "@/config/business-rules";
import { getGiftForOwner } from "@/modules/gifts";
import { payOSProvider } from "./providers/payos";
import type { PaymentProvider } from "./provider";

const provider: PaymentProvider = payOSProvider;

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";
const MAX_ORDER_CODE_ATTEMPTS = 5;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

/** A JS-safe integer PayOS orderCode; DB uniqueness is the real guarantee (retried on collision). */
function generateOrderCode(): number {
  return Date.now() * 1000 + randomInt(0, 999);
}

export interface VipCheckout {
  checkoutUrl: string;
  qrCode: string;
  orderCode: string;
}

/**
 * Creates a Payment row and a PayOS checkout for upgrading `giftId` to VIP.
 * VIP is never activated here — only a webhook can do that (see
 * handlePaymentWebhook below). Only DRAFT/ACTIVE gifts are eligible; other
 * statuses (EXPIRED/RECOVERY/DELETION_PENDING/DELETED/SUSPENDED) would
 * need unspecified "resurrection" semantics that are out of scope for V1.
 */
export async function createVipCheckout(userId: string, giftId: string): Promise<VipCheckout> {
  const gift = await getGiftForOwner(giftId, userId);

  if (gift.status !== "DRAFT" && gift.status !== "ACTIVE") {
    throw new ConflictError("Only draft or active gifts can be upgraded to VIP");
  }

  const amountVnd = env.VIP_PRICE_VND;

  for (let attempt = 0; attempt < MAX_ORDER_CODE_ATTEMPTS; attempt++) {
    const orderCodeNumber = generateOrderCode();
    const orderCode = String(orderCodeNumber);

    let payment;
    try {
      payment = await prisma.payment.create({
        data: {
          userId,
          giftId: gift.id,
          provider: provider.name,
          orderCode,
          amount: amountVnd,
          currency: "VND",
          product: "VIP_15D",
          status: "CREATED",
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) continue; // orderCode collision — retry with a fresh one
      throw error;
    }

    const checkout = await provider.createCheckout({
      orderCode: orderCodeNumber,
      amountVnd,
      description: `LoveBox VIP ${orderCode.slice(-8)}`,
      returnUrl: `${env.APP_URL}/gifts/${gift.id}?payment=return`,
      cancelUrl: `${env.APP_URL}/gifts/${gift.id}?payment=cancelled`,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PENDING", providerTransactionId: checkout.providerPaymentId },
    });

    return { checkoutUrl: checkout.checkoutUrl, qrCode: checkout.qrCode, orderCode };
  }

  throw new Error("Failed to create VIP checkout: could not generate a unique order code");
}

/**
 * The only path that may ever activate VIP. See CLAUDE.md P0 rule:
 * webhook/server verification → signature → transaction ID → exact amount
 * → currency → product → duplicate check → DB transaction → activate
 * exactly once. Duplicate webhooks = exactly one activation. Wrong
 * amount/signature/replay = never activate.
 */
export async function handlePaymentWebhook(rawBody: unknown): Promise<void> {
  // 1. Signature. Throws (via the provider) on anything invalid — nothing
  // below this line ever runs for a forged/malformed webhook.
  const event = await provider.verifyAndParseWebhook(rawBody);

  // 2. Only a genuine "payment succeeded" notification proceeds.
  if (!event.success || event.code !== "00") {
    logger.info({ orderCode: event.orderCode, code: event.code }, "non-success payment webhook — ignoring");
    return;
  }

  const payment = await prisma.payment.findUnique({ where: { orderCode: String(event.orderCode) } });
  if (!payment || payment.provider !== provider.name) {
    logger.warn({ orderCode: event.orderCode }, "webhook for unknown payment — ignoring");
    return;
  }

  // 3. Duplicate check (fast path). The atomic guard inside the
  // transaction below is what actually makes this race-safe; this is
  // just an early exit for the common case.
  if (payment.status === "ACTIVATED") {
    return;
  }

  // 4. Exact amount + currency, checked against what *our* server set at
  // checkout time — never trust the webhook's own claims beyond this.
  if (event.amountVnd !== payment.amount || event.currency !== payment.currency) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { notIn: ["ACTIVATED"] } },
      data: { status: "REJECTED", rawWebhook: event.raw as Prisma.InputJsonValue },
    });
    logger.error(
      {
        paymentId: payment.id,
        expectedAmount: payment.amount,
        gotAmount: event.amountVnd,
        expectedCurrency: payment.currency,
        gotCurrency: event.currency,
      },
      "payment amount/currency mismatch — rejecting, never activating",
    );
    return;
  }

  // 5. Duplicate check (atomic) + activation, in one transaction. The
  // updateMany's WHERE guard means only one concurrent delivery can ever
  // "win" the claim (count === 1); a loser (count === 0) skips the gift
  // update entirely. Both the claim and the gift/tier update commit or
  // roll back together, so a crash between them can never leave a payment
  // ACTIVATED without the gift actually having been upgraded (or vice
  // versa) — see CLAUDE.md: "activate exactly once."
  const wonClaim = await prisma.$transaction(async (tx) => {
    const claim = await tx.payment.updateMany({
      where: { id: payment.id, status: { notIn: ["ACTIVATED"] } },
      data: {
        status: "ACTIVATED",
        providerTransactionId: event.providerTransactionId,
        verifiedAt: new Date(),
        activatedAt: new Date(),
        rawWebhook: event.raw as Prisma.InputJsonValue,
      },
    });

    if (claim.count === 0) {
      return false; // a concurrent/duplicate delivery already activated this payment
    }

    if (!payment.giftId) return true;

    const gift = await tx.gift.findUnique({ where: { id: payment.giftId } });
    if (!gift) {
      logger.error({ paymentId: payment.id }, "payment references a gift that no longer exists");
      return true;
    }

    const newExpiresAt =
      gift.status === "ACTIVE" && gift.activeExpiresAt
        ? renewedVipExpiry(gift.activeExpiresAt)
        : gift.activeExpiresAt; // DRAFT gift: leave null — publish() computes VIP duration later

    await tx.gift.update({
      where: { id: gift.id },
      data: { tier: "VIP", activeExpiresAt: newExpiresAt },
    });
    return true;
  });

  if (wonClaim) {
    logger.info({ paymentId: payment.id, orderCode: event.orderCode }, "VIP payment activated");
  } else {
    logger.info(
      { paymentId: payment.id, orderCode: event.orderCode },
      "duplicate webhook delivery — payment already activated by a prior delivery",
    );
  }
}
