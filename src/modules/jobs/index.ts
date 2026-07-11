// Public API of the `jobs` module.
// Other modules must import only from this file — never reach into
// `src/modules/jobs/*` internals directly.

import { runJob, type JobResult } from "./job-run";
import {
  expireActiveGifts,
  promoteExpiredToRecovery,
  promoteRecoveryToDeletionPending,
  purgeDeletionPendingGifts,
} from "./lifecycle";
import { cleanupOrphanedMedia, cleanupOldAnalytics, cleanupOldRateLimitHits } from "./cleanup";

export interface LifecycleRunSummary {
  startedAt: string;
  finishedAt: string;
  steps: JobResult[];
}

/**
 * Runs every lifecycle/cleanup step once, in order. Each step is wrapped
 * independently (via runJob) so one step failing doesn't stop the rest —
 * see CLAUDE.md: background jobs are idempotent cron routes. Intended to
 * be called from a single Vercel Cron-triggered route (Hobby plan allows
 * only a couple of cron schedules, so everything is combined here rather
 * than split across multiple routes).
 */
export async function runLifecycleJobs(): Promise<LifecycleRunSummary> {
  const startedAt = new Date();

  const steps: JobResult[] = [
    await runJob("expire", () => expireActiveGifts(startedAt)),
    await runJob("recovery-start", () => promoteExpiredToRecovery(startedAt)),
    await runJob("recovery-end", () => promoteRecoveryToDeletionPending(startedAt)),
    await runJob("purge", () => purgeDeletionPendingGifts(startedAt)),
    await runJob("orphan-cleanup", () => cleanupOrphanedMedia(startedAt)),
    await runJob("analytics-retention", () => cleanupOldAnalytics(startedAt)),
    await runJob("rate-limit-cleanup", () => cleanupOldRateLimitHits(startedAt)),
  ];

  return { startedAt: startedAt.toISOString(), finishedAt: new Date().toISOString(), steps };
}
