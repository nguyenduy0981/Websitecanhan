import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth } from "@/modules/auth";
import { createBlockSchema, listBlocks, addBlock } from "@/modules/gifts";

type Ctx = { params: Promise<{ giftId: string }> };

export const GET = withApiHandler<Ctx>(async (req: NextRequest, { params }) => {
  const user = await requireAuth(req);
  const { giftId } = await params;
  const blocks = await listBlocks(giftId, user.id);
  return NextResponse.json({ blocks });
});

export const POST = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req);
  const { giftId } = await params;
  const body = parseOrThrow(createBlockSchema, await req.json());

  const block = await addBlock(giftId, user.id, body);
  log.info({ userId: user.id, giftId, blockId: block.id }, "gift block added");

  return NextResponse.json({ block }, { status: 201 });
});
