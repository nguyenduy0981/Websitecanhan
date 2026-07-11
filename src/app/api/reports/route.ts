import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { getClientIp } from "@/lib/request";
import { getSessionUser } from "@/modules/auth";
import { createReportSchema, createReport } from "@/modules/admin";

// Public — anonymous or logged-in visitors on the gift viewer can report
// content. Rate-limited by IP inside createReport (see admin/reports.ts).
export const POST = withApiHandler(async (req: NextRequest, { log }) => {
  const body = parseOrThrow(createReportSchema, await req.json());
  const ip = getClientIp(req);
  const user = await getSessionUser(req.cookies);

  await createReport(body, user?.id ?? null, ip);
  log.info({ slug: body.slug, reason: body.reason }, "content report submitted");

  return NextResponse.json({ ok: true }, { status: 201 });
});
