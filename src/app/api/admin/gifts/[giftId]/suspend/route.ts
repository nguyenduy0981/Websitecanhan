import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/modules/auth";
import { requireRole, suspendGift } from "@/modules/admin";

type Ctx = { params: Promise<{ giftId: string }> };

export const POST = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  requireRole(user, "MODERATOR");

  const { giftId } = await params;
  const gift = await suspendGift(giftId, user.id);
  log.info({ userId: user.id, giftId }, "gift suspended by moderator");

  return NextResponse.json({ gift });
});
