import type { JobRun } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Recent cron job history, newest first — for the admin monitoring page. */
export async function listRecentJobRuns(limit = 30): Promise<JobRun[]> {
  return prisma.jobRun.findMany({ orderBy: { startedAt: "desc" }, take: limit });
}
