import { prisma } from "@/lib/prisma";
import { RateLimitedError } from "@/lib/errors";

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

// Recorded assumption (owner may override): thresholds below are a
// reasonable production-ready default for V1, not a CLAUDE.md non-negotiable
// business rule.
export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 },
  report: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitRule>;

/** Pure decision helper (no I/O) so the limiting logic is unit-testable without a DB. */
export function isOverLimit(hitCountInWindow: number, rule: RateLimitRule): boolean {
  return hitCountInWindow >= rule.limit;
}

/**
 * DB-backed sliding-window rate limiter (Neon, not a new paid service — see
 * CLAUDE.md Cost rules). Throws RateLimitedError once `rule.limit` hits for
 * `key` land within `rule.windowMs`. See CLAUDE.md: "rate limits on
 * login/register/reset."
 */
export async function checkRateLimit(key: string, rule: RateLimitRule): Promise<void> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - rule.windowMs);

  const hitCount = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (isOverLimit(hitCount, rule)) {
    throw new RateLimitedError("Too many attempts. Please try again later.");
  }

  await prisma.rateLimitHit.create({ data: { key } });

  // Opportunistic cleanup so this table doesn't grow unbounded before the
  // Milestone 7 background job takes over retention.
  await prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: windowStart } } });
}
