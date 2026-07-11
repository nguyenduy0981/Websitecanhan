import type { GiftStatus, Report, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { getGiftBySlug, classifyGiftForViewer } from "@/modules/gifts";
import { checkRateLimit, RATE_LIMITS } from "@/modules/auth";
import type { CreateReportInput } from "./schemas";
import { suspendGift } from "./moderation";
import { writeAuditLog } from "./audit";

/**
 * Anonymous-friendly content reporting from the public viewer. A DRAFT
 * gift is treated identically to "doesn't exist" here too — same rule as
 * the viewer itself (see gifts/public.ts classifyGiftForViewer) — so this
 * endpoint can never be used to probe for unpublished gifts by slug.
 */
export async function createReport(
  input: CreateReportInput,
  reporterId: string | null,
  ip: string,
): Promise<void> {
  await checkRateLimit(`report:${ip}`, RATE_LIMITS.report);

  const gift = await getGiftBySlug(input.slug);
  if (!gift || classifyGiftForViewer(gift.status).type === "not_found") {
    throw new NotFoundError("Gift not found");
  }

  await prisma.report.create({
    data: {
      giftId: gift.id,
      reporterId,
      reason: input.reason,
      details: input.details,
    },
  });
}

export interface ReportWithGift extends Report {
  gift: { id: string; slug: string; title: string; status: GiftStatus; ownerId: string };
}

export async function listReportsForAdmin(status?: ReportStatus): Promise<ReportWithGift[]> {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    include: {
      gift: { select: { id: true, slug: true, title: true, status: true, ownerId: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as Promise<ReportWithGift[]>;
}

/** For the admin monitoring overview. */
export async function countOpenReports(): Promise<number> {
  return prisma.report.count({ where: { status: "OPEN" } });
}

/**
 * SUSPEND both resolves the report and suspends the reported gift;
 * DISMISS only resolves the report. Resolving an already-resolved report
 * is rejected — re-suspending/re-dismissing a closed report has no
 * meaningful effect and likely indicates a stale admin UI.
 */
export async function resolveReport(
  reportId: string,
  actorId: string,
  action: "DISMISS" | "SUSPEND",
): Promise<Report> {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new NotFoundError("Report not found");
  }
  if (report.status !== "OPEN" && report.status !== "REVIEWED") {
    throw new ConflictError("Report has already been resolved");
  }

  if (action === "SUSPEND") {
    await suspendGift(report.giftId, actorId, { reportId });
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: action === "SUSPEND" ? "ACTION_TAKEN" : "DISMISSED",
      resolvedBy: actorId,
      resolvedAt: new Date(),
    },
  });

  await writeAuditLog(actorId, `REPORT_${action === "SUSPEND" ? "ACTION_TAKEN" : "DISMISSED"}`, "Report", reportId, {
    giftId: report.giftId,
  });

  return updated;
}
