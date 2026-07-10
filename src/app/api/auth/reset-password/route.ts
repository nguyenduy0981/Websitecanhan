import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { resetPasswordSchema, resetPassword } from "@/modules/auth";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = parseOrThrow(resetPasswordSchema, await req.json());
  await resetPassword(body);
  return NextResponse.json({ ok: true });
});
