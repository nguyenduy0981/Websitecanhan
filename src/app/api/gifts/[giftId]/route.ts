import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth } from "@/modules/auth";
import { updateGiftSchema, getGiftForOwner, updateGift, deleteGift } from "@/modules/gifts";

type Ctx = { params: Promise<{ giftId: string }> };

export const GET = withApiHandler<Ctx>(async (req: NextRequest, { params }) => {
  const user = await requireAuth(req.cookies);
  const { giftId } = await params;
  const gift = await getGiftForOwner(giftId, user.id);
  return NextResponse.json({ gift });
});

export const PATCH = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  const { giftId } = await params;
  const body = parseOrThrow(updateGiftSchema, await req.json());

  const gift = await updateGift(giftId, user.id, body);
  log.info({ userId: user.id, giftId }, "gift updated");

  return NextResponse.json({ gift });
});

export const DELETE = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  const { giftId } = await params;

  await deleteGift(giftId, user.id);
  log.info({ userId: user.id, giftId }, "gift deleted");

  return NextResponse.json({ ok: true });
});
