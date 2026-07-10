import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/modules/auth";

export const GET = withApiHandler(async (req: NextRequest) => {
  const user = await getSessionUser(req);
  return NextResponse.json({ user });
});
