import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { handlePaymentWebhook } from "@/modules/payments";

// Public endpoint — called by PayOS's servers, not a logged-in user.
// Authenticity is established by verifying the webhook's own signature
// inside handlePaymentWebhook, not by a session cookie.
export const POST = withApiHandler(async (req: NextRequest, { log }) => {
  const body = await req.json();
  await handlePaymentWebhook(body);
  log.info("payment webhook processed");
  return NextResponse.json({ success: true });
});
