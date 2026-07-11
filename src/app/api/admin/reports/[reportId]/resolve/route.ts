import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { parseOrThrow } from "@/lib/validation";
import { requireAuth } from "@/modules/auth";
import { requireRole, resolveReportSchema, resolveReport } from "@/modules/admin";

type Ctx = { params: Promise<{ reportId: string }> };

export const POST = withApiHandler<Ctx>(async (req: NextRequest, { params, log }) => {
  const user = await requireAuth(req.cookies);
  requireRole(user, "MODERATOR");

  const { reportId } = await params;
  const { action } = parseOrThrow(resolveReportSchema, await req.json());

  const report = await resolveReport(reportId, user.id, action);
  log.info({ userId: user.id, reportId, action }, "report resolved");

  return NextResponse.json({ report });
});
