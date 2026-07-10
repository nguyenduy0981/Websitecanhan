import { describe, expect, it } from "vitest";
import { isOverLimit, RATE_LIMITS } from "@/modules/auth/rate-limit";

describe("isOverLimit", () => {
  it("is not over limit when hit count is below the rule limit", () => {
    expect(isOverLimit(0, RATE_LIMITS.login)).toBe(false);
    expect(isOverLimit(RATE_LIMITS.login.limit - 1, RATE_LIMITS.login)).toBe(false);
  });

  it("is over limit once hit count reaches the rule limit", () => {
    expect(isOverLimit(RATE_LIMITS.login.limit, RATE_LIMITS.login)).toBe(true);
    expect(isOverLimit(RATE_LIMITS.login.limit + 1, RATE_LIMITS.login)).toBe(true);
  });

  it("applies independently per rule", () => {
    expect(isOverLimit(RATE_LIMITS.register.limit, RATE_LIMITS.passwordReset)).toBe(true);
  });
});
