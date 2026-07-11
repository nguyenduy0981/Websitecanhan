import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/modules/auth";
import { createVipCheckout } from "@/modules/payments";

type Ctx = { params: Promise<{ giftId: string }> };

export const POST = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  const { giftId } = await params;

  const checkout = await createVipCheckout(user.id, giftId);
  log.info({ userId: user.id, giftId, orderCode: checkout.orderCode }, "VIP checkout created");

  return NextResponse.json({ checkout });
});
