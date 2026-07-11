import { NextResponse, type NextRequest } from "next/server";
import type { ReportStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/api-handler";
import { requireAuth } from "@/modules/auth";
import { requireRole, listReportsForAdmin } from "@/modules/admin";

const VALID_STATUSES: readonly ReportStatus[] = ["OPEN", "REVIEWED", "ACTION_TAKEN", "DISMISSED"];

export const GET = withApiHandler(async (req: NextRequest) => {
  const user = await requireAuth(req.cookies);
  requireRole(user, "MODERATOR");

  const statusParam = req.nextUrl.searchParams.get("status");
  const status =
    statusParam && VALID_STATUSES.includes(statusParam as ReportStatus)
      ? (statusParam as ReportStatus)
      : undefined;

  const reports = await listReportsForAdmin(status);
  return NextResponse.json({ reports });
});
