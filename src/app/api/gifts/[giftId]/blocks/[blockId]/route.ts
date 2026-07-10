import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth } from "@/modules/auth";
import { updateBlockSchema, updateBlock, deleteBlock } from "@/modules/gifts";

type Ctx = { params: Promise<{ giftId: string; blockId: string }> };

export const PATCH = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  const { giftId, blockId } = await params;
  const body = parseOrThrow(updateBlockSchema, await req.json());

  const block = await updateBlock(giftId, blockId, user.id, body.content);
  log.info({ userId: user.id, giftId, blockId }, "gift block updated");

  return NextResponse.json({ block });
});

export const DELETE = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  const { giftId, blockId } = await params;

  await deleteBlock(giftId, blockId, user.id);
  log.info({ userId: user.id, giftId, blockId }, "gift block deleted");

  return NextResponse.json({ ok: true });
});
