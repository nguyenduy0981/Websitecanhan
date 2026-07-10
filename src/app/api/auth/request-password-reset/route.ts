import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { getClientIp } from "@/lib/request";
import { requestPasswordResetSchema, requestPasswordReset } from "@/modules/auth";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = parseOrThrow(requestPasswordResetSchema, await req.json());
  const ip = getClientIp(req);

  await requestPasswordReset(body.email, { ip });

  // Always the same response, whether or not the email exists — avoids
  // account enumeration via the "forgot password" flow.
  return NextResponse.json({
    ok: true,
    message: "If an account exists for this email, a reset link has been sent.",
  });
});
