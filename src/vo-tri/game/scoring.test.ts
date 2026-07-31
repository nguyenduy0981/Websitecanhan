import { describe, expect, it } from "vitest";
import { DEFAULT_SCORING } from "./scoring";

describe("DEFAULT_SCORING", () => {
  it("returns the base points unchanged with no difficulty and no combo", () => {
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 0 })).toBe(10);
  });

  it("applies the difficulty multiplier", () => {
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 0, difficulty: "de" })).toBe(10);
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 0, difficulty: "vua" })).toBe(13); // 12.5 rounds up
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 0, difficulty: "kho" })).toBe(15);
  });

  it("applies +10% per combo stack", () => {
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 1 })).toBe(11);
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 5 })).toBe(15);
  });

  it("caps the combo bonus at 10 stacks (+100%) even with a much higher combo", () => {
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 10 })).toBe(20);
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 999 })).toBe(20);
  });

  it("compounds difficulty and combo multipliers together", () => {
    // 10 * 1.5 (kho) * 1.3 (combo 3) = 19.5 -> rounds to 20
    expect(DEFAULT_SCORING({ basePoints: 10, comboCount: 3, difficulty: "kho" })).toBe(20);
  });
});
