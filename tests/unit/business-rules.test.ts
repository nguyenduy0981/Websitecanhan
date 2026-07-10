import { describe, expect, it } from "vitest";
import {
  FREE_ACTIVE_DURATION_DAYS,
  VIP_ACTIVE_DURATION_DAYS,
  activeDurationDays,
  renewedVipExpiry,
} from "@/config/business-rules";

describe("business rules constants", () => {
  it("locks Free active duration to exactly 3 days", () => {
    expect(FREE_ACTIVE_DURATION_DAYS).toBe(3);
    expect(activeDurationDays("FREE")).toBe(3);
  });

  it("locks VIP active duration to exactly 15 days", () => {
    expect(VIP_ACTIVE_DURATION_DAYS).toBe(15);
    expect(activeDurationDays("VIP")).toBe(15);
  });
});

describe("renewedVipExpiry", () => {
  it("adds exactly 15 days to the current expiry", () => {
    const currentExpiresAt = new Date("2026-01-01T00:00:00.000Z");
    const renewed = renewedVipExpiry(currentExpiresAt);
    expect(renewed.toISOString()).toBe("2026-01-16T00:00:00.000Z");
  });

  it("extends from the existing expiry, not from now, so renewing never shortens paid time", () => {
    const farFutureExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const renewed = renewedVipExpiry(farFutureExpiry);
    const expected = farFutureExpiry.getTime() + 15 * 24 * 60 * 60 * 1000;
    expect(renewed.getTime()).toBe(expected);
    expect(renewed.getTime()).not.toBe(Date.now() + 15 * 24 * 60 * 60 * 1000);
  });
});
