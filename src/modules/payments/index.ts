// Public API of the `payments` module.
// Other modules must import only from this file — never reach into
// `src/modules/payments/*` internals directly.

export { createVipCheckout, handlePaymentWebhook, type VipCheckout } from "./service";
