import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth, checkRateLimit, RATE_LIMITS } from "@/modules/auth";
import { createGiftSchema, createGift, listGiftsForOwner } from "@/modules/gifts";

export const GET = withApiHandler(async (req: NextRequest) => {
  const user = await requireAuth(req.cookies);
  const gifts = await listGiftsForOwner(user.id);
  return NextResponse.json({ gifts });
});

export const POST = withApiHandler(async (req: NextRequest, { log }) => {
  const user = await requireAuth(req.cookies);
  await checkRateLimit(`gift-create:${user.id}`, RATE_LIMITS.giftCreate);
  const body = parseOrThrow(createGiftSchema, await req.json());

  const gift = await createGift(user.id, body);
  log.info({ userId: user.id, giftId: gift.id }, "gift created");

  return NextResponse.json({ gift }, { status: 201 });
});
