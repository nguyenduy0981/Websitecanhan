import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { ValidationError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth";
import { getGiftForOwner, assertEditable } from "@/modules/gifts";
import { uploadImageForGift } from "@/modules/media";

type Ctx = { params: Promise<{ giftId: string }> };

export const POST = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  const { giftId } = await params;

  const gift = await getGiftForOwner(giftId, user.id);
  assertEditable(gift);

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new ValidationError("A file is required");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const media = await uploadImageForGift(user.id, gift.id, gift.tier, buffer);
  log.info({ userId: user.id, giftId, mediaAssetId: media.id }, "gift image uploaded");

  return NextResponse.json({ media }, { status: 201 });
});
