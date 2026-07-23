import { describe, expect, it } from "vitest";
import { getDailyQuests, weeklyGoals } from "./quests";

describe("getDailyQuests", () => {
  it("always includes the two constant core quests plus exactly one bonus", () => {
    const quests = getDailyQuests(new Date(Date.UTC(2026, 0, 1)));
    expect(quests).toHaveLength(3);
    expect(quests[0]!.id).toBe("daily-check-in");
    expect(quests[1]!.id).toBe("daily-play-two");
  });

  it("is deterministic for the same calendar date", () => {
    const a = getDailyQuests(new Date(Date.UTC(2026, 3, 10)));
    const b = getDailyQuests(new Date(Date.UTC(2026, 3, 10)));
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it("rotates the bonus quest across the 3-item pool as the day changes", () => {
    // day-of-year 1, 2, 3 map to bonus-pool indices 1, 2, 0 (1%3, 2%3, 3%3).
    const day1 = getDailyQuests(new Date(Date.UTC(2026, 0, 1)))[2]!.id;
    const day2 = getDailyQuests(new Date(Date.UTC(2026, 0, 2)))[2]!.id;
    const day3 = getDailyQuests(new Date(Date.UTC(2026, 0, 3)))[2]!.id;
    expect(new Set([day1, day2, day3]).size).toBe(3);
  });

  it("cycles back to the same bonus quest exactly one pool-length later", () => {
    const day1 = getDailyQuests(new Date(Date.UTC(2026, 0, 1)))[2]!.id;
    const day4 = getDailyQuests(new Date(Date.UTC(2026, 0, 4)))[2]!.id;
    expect(day4).toBe(day1);
  });
});

describe("weeklyGoals", () => {
  it("is a real, non-empty, stable catalog", () => {
    expect(weeklyGoals.length).toBeGreaterThan(0);
    expect(weeklyGoals.every((g) => g.cadence === "weekly")).toBe(true);
    expect(new Set(weeklyGoals.map((g) => g.id)).size).toBe(weeklyGoals.length);
  });
});
