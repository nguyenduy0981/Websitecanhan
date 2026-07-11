import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface JobResult {
  name: string;
  ok: boolean;
  itemsProcessed: number;
  error?: string;
}

/**
 * Runs one named job step, recording a JobRun row for observability, and
 * never throwing — a failure in one step must not prevent the others in
 * the same cron invocation from running. See CLAUDE.md: background jobs
 * are idempotent cron routes.
 */
export async function runJob(name: string, fn: () => Promise<number>): Promise<JobResult> {
  const startedAt = new Date();
  try {
    const itemsProcessed = await fn();
    await prisma.jobRun.create({
      data: { name, startedAt, finishedAt: new Date(), ok: true, itemsProcessed },
    });
    return { name, ok: true, itemsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ err: error, job: name }, "job step failed");
    await prisma.jobRun.create({
      data: {
        name,
        startedAt,
        finishedAt: new Date(),
        ok: false,
        itemsProcessed: 0,
        error: message,
      },
    });
    return { name, ok: false, itemsProcessed: 0, error: message };
  }
}
