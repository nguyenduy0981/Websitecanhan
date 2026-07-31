import { describe, expect, it } from "vitest";
import { dayOfYear } from "./date";

describe("dayOfYear", () => {
  it("returns 1 for January 1st", () => {
    expect(dayOfYear(new Date(Date.UTC(2026, 0, 1)))).toBe(1);
  });

  it("returns 32 for February 1st (31 days into January)", () => {
    expect(dayOfYear(new Date(Date.UTC(2026, 1, 1)))).toBe(32);
  });

  it("returns 365 for December 31st of a non-leap year", () => {
    // 2026 is not a leap year.
    expect(dayOfYear(new Date(Date.UTC(2026, 11, 31)))).toBe(365);
  });

  it("returns 366 for December 31st of a leap year", () => {
    expect(dayOfYear(new Date(Date.UTC(2028, 11, 31)))).toBe(366);
  });

  it("is stable across different times on the same UTC day", () => {
    const morning = new Date(Date.UTC(2026, 5, 15, 1, 0, 0));
    const night = new Date(Date.UTC(2026, 5, 15, 23, 59, 59));
    expect(dayOfYear(morning)).toBe(dayOfYear(night));
  });
});
