import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth } from "@/modules/auth";
import { reorderBlocksSchema, reorderBlocks } from "@/modules/gifts";

type Ctx = { params: Promise<{ giftId: string }> };

export const PUT = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req);
  const { giftId } = await params;
  const body = parseOrThrow(reorderBlocksSchema, await req.json());

  const blocks = await reorderBlocks(giftId, user.id, body);
  log.info({ userId: user.id, giftId }, "gift blocks reordered");

  return NextResponse.json({ blocks });
});
