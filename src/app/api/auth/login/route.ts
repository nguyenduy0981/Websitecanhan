import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { getClientIp } from "@/lib/request";
import { loginSchema, loginUser, setSessionCookie } from "@/modules/auth";

export const POST = withApiHandler(async (req: NextRequest, { log }) => {
  const body = parseOrThrow(loginSchema, await req.json());
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const { user, sessionToken, sessionExpiresAt } = await loginUser(body, { ip, userAgent });
  log.info({ userId: user.id }, "user logged in");

  const res = NextResponse.json({ user });
  setSessionCookie(res, sessionToken, sessionExpiresAt);
  return res;
});
