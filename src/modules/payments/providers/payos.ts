import { PayOS, PayOSError } from "@payos/node";
import type { Webhook } from "@payos/node";
import { env, isPayOSConfigured } from "@/env";
import { ServiceUnavailableError, ValidationError } from "@/lib/errors";
import type { CreateCheckoutInput, CheckoutResult, VerifiedPaymentEvent, PaymentProvider } from "../provider";

let cachedClient: PayOS | null = null;

function getClient(): PayOS {
  if (!isPayOSConfigured) {
    throw new ServiceUnavailableError(
      "VIP payment isn't available yet — payments haven't been configured.",
    );
  }
  if (!cachedClient) {
    cachedClient = new PayOS({
      clientId: env.PAYOS_CLIENT_ID,
      apiKey: env.PAYOS_API_KEY,
      checksumKey: env.PAYOS_CHECKSUM_KEY,
    });
  }
  return cachedClient;
}

export const payOSProvider: PaymentProvider = {
  name: "payos",

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const client = getClient();
    const link = await client.paymentRequests.create({
      orderCode: input.orderCode,
      amount: input.amountVnd,
      description: input.description,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    });
    return {
      checkoutUrl: link.checkoutUrl,
      qrCode: link.qrCode,
      providerPaymentId: link.paymentLinkId,
    };
  },

  /**
   * Delegates signature verification to PayOS's own SDK
   * (`webhooks.verify`), which recomputes the HMAC over the webhook's
   * `data` object using the checksum key and throws `WebhookError` if it
   * doesn't match — we never re-implement that crypto ourselves. See
   * CLAUDE.md: "Wrong amount/signature/replay = never activate."
   */
  async verifyAndParseWebhook(rawBody: unknown): Promise<VerifiedPaymentEvent> {
    const client = getClient();
    const webhook = rawBody as Webhook;

    let data;
    try {
      data = await client.webhooks.verify(webhook);
    } catch (error) {
      if (error instanceof PayOSError) {
        throw new ValidationError("Invalid webhook signature");
      }
      throw error;
    }

    return {
      success: webhook.success,
      code: webhook.code,
      orderCode: data.orderCode,
      amountVnd: data.amount,
      currency: data.currency,
      providerTransactionId: data.reference,
      raw: webhook,
    };
  },
};
