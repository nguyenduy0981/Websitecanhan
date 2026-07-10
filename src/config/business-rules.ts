// LoveBox business rules — see CLAUDE.md "Non-negotiable business rules".
// Changing these values requires explicit owner approval.

export type GiftTier = "FREE" | "VIP";

export const FREE_ACTIVE_DURATION_DAYS = 3;
export const VIP_ACTIVE_DURATION_DAYS = 15;

function parsePositiveIntEnv(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const RECOVERY_DURATION_DAYS = parsePositiveIntEnv(
  process.env.RECOVERY_DURATION_DAYS,
  7,
);

export const ANALYTICS_RETENTION_DAYS = 90;

export const QUOTAS = {
  FREE_MAX_IMAGES_PER_GIFT: 5,
  VIP_MAX_IMAGES_PER_GIFT: 20,
  MAX_IMAGE_UPLOAD_MB: 10,
} as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Number of days a gift stays ACTIVE for the given tier. */
export function activeDurationDays(tier: GiftTier): number {
  return tier === "VIP" ? VIP_ACTIVE_DURATION_DAYS : FREE_ACTIVE_DURATION_DAYS;
}

/**
 * VIP renewal while active extends from the current expiry, not from now,
 * so stacking a renewal never shortens time the user already paid for.
 */
export function renewedVipExpiry(currentExpiresAt: Date): Date {
  return new Date(currentExpiresAt.getTime() + VIP_ACTIVE_DURATION_DAYS * MS_PER_DAY);
}
