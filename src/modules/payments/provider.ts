// Payments are behind this interface so PayOS is swappable later without
// touching the security-critical activation logic in service.ts — see
// CLAUDE.md Architecture: "Payments behind a PaymentProvider interface."

export interface CreateCheckoutInput {
  orderCode: number;
  amountVnd: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  qrCode: string;
  providerPaymentId: string;
}

export interface VerifiedPaymentEvent {
  /** True only for a genuine payment-succeeded notification. */
  success: boolean;
  code: string;
  orderCode: number;
  amountVnd: number;
  currency: string;
  /** The provider's own transaction reference — used as the DB-level duplicate-webhook guard. */
  providerTransactionId: string;
  raw: unknown;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>;
  /**
   * Verifies the webhook's signature and returns the parsed event.
   * Must throw (never return a "verified" result) if the signature is
   * missing, malformed, or doesn't match — see CLAUDE.md: "Wrong
   * amount/signature/replay = never activate."
   */
  verifyAndParseWebhook(rawBody: unknown): Promise<VerifiedPaymentEvent>;
}
