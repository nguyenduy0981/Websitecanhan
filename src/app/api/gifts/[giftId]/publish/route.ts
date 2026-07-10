import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/modules/auth";
import { publishGift } from "@/modules/gifts";

type Ctx = { params: Promise<{ giftId: string }> };

export const POST = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req);
  const { giftId } = await params;

  const gift = await publishGift(giftId, user.id);
  log.info({ userId: user.id, giftId }, "gift published");

  return NextResponse.json({ gift });
});
