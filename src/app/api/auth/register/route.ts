import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { getClientIp } from "@/lib/request";
import { registerSchema, registerUser, setSessionCookie } from "@/modules/auth";

export const POST = withApiHandler(async (req: NextRequest, { log }) => {
  const body = parseOrThrow(registerSchema, await req.json());
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const { user, sessionToken, sessionExpiresAt } = await registerUser(body, { ip, userAgent });
  log.info({ userId: user.id }, "user registered");

  const res = NextResponse.json({ user }, { status: 201 });
  setSessionCookie(res, sessionToken, sessionExpiresAt);
  return res;
});
