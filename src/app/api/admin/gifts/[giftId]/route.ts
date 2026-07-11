import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/modules/auth";
import { requireRole } from "@/modules/admin";
import { getGiftForAdmin, listBlocksForAdmin } from "@/modules/gifts";

type Ctx = { params: Promise<{ giftId: string }> };

// Bypasses ownership — lets a moderator see the actual reported content.
export const GET = withApiHandler<Ctx>(async (req: NextRequest, { params }) => {
  const user = await requireAuth(req.cookies);
  requireRole(user, "MODERATOR");

  const { giftId } = await params;
  const gift = await getGiftForAdmin(giftId);
  const blocks = await listBlocksForAdmin(giftId);

  return NextResponse.json({ gift, blocks });
});
