import { describe, expect, it } from "vitest";
import { dilemmas, getDailyDilemma, getDilemmaById } from "./dilemmas";

describe("dilemmas", () => {
  it("is a real, non-empty, stable catalog with unique ids", () => {
    expect(dilemmas.length).toBeGreaterThan(0);
    expect(new Set(dilemmas.map((d) => d.id)).size).toBe(dilemmas.length);
  });
});

describe("getDailyDilemma", () => {
  it("is deterministic for the same calendar date", () => {
    const a = getDailyDilemma(new Date(Date.UTC(2026, 3, 10)));
    const b = getDailyDilemma(new Date(Date.UTC(2026, 3, 10)));
    expect(a.id).toBe(b.id);
  });

  it("rotates across the pool as the day changes", () => {
    const day1 = getDailyDilemma(new Date(Date.UTC(2026, 0, 1))).id;
    const day2 = getDailyDilemma(new Date(Date.UTC(2026, 0, 2))).id;
    expect(day1).not.toBe(day2);
  });

  it("cycles back to the same dilemma exactly one pool-length later", () => {
    const day1 = getDailyDilemma(new Date(Date.UTC(2026, 0, 1))).id;
    const wrapped = getDailyDilemma(new Date(Date.UTC(2026, 0, 1 + dilemmas.length))).id;
    expect(wrapped).toBe(day1);
  });
});

describe("getDilemmaById", () => {
  it("finds a real dilemma by id", () => {
    const first = dilemmas[0]!;
    expect(getDilemmaById(first.id)).toEqual(first);
  });

  it("returns undefined for an unknown id", () => {
    expect(getDilemmaById("not-a-real-id")).toBeUndefined();
  });
});
