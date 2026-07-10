import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { getSessionToken, clearSessionCookie, logoutUser } from "@/modules/auth";

export const POST = withApiHandler(async (req: NextRequest) => {
  const token = getSessionToken(req.cookies);
  if (token) {
    await logoutUser(token);
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
});
