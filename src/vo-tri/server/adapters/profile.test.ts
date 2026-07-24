import { describe, expect, it } from "vitest";
import { toLevelProgress, toProfileIdentity, toProfileStats, toStreakData, toTodayStats } from "./profile";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const fixtureRow: ProfileRow = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  username: "be_vo_tri",
  display_name: "Bé Vô Tri",
  avatar_url: null,
  tagline: null,
  points: 120,
  total_xp_earned: 340,
  level: 3,
  xp: 40,
  xp_to_next: 100,
  current_streak: 4,
  longest_streak: 9,
  last_active_date: "2026-07-24",
  total_active_days: 12,
  total_activities_played: 25,
  joined_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-07-24T00:00:00.000Z",
};

describe("toProfileIdentity", () => {
  it("maps null avatar/tagline to undefined", () => {
    expect(toProfileIdentity(fixtureRow)).toEqual({
      displayName: "Bé Vô Tri",
      username: "be_vo_tri",
      avatarUrl: undefined,
      tagline: undefined,
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });
});

describe("toProfileStats", () => {
  it("maps current_streak -> streakDays and total_* fields", () => {
    expect(toProfileStats(fixtureRow)).toEqual({
      points: 120,
      level: 3,
      xp: 40,
      streakDays: 4,
      activeDays: 12,
      activitiesPlayed: 25,
    });
  });
});

describe("toLevelProgress", () => {
  it("maps level/xp/xp_to_next", () => {
    expect(toLevelProgress(fixtureRow)).toEqual({ level: 3, xp: 40, xpToNext: 100 });
  });
});

describe("toStreakData", () => {
  it("marks only the dates present in activeDates as active, oldest-first ending in today", () => {
    const reference = new Date("2026-07-24T12:00:00.000Z");
    const active = new Set(["2026-07-22", "2026-07-24"]);
    const streak = toStreakData(fixtureRow, active, reference);
    expect(streak.currentStreak).toBe(4);
    expect(streak.longestStreak).toBe(9);
    expect(streak.last7Days).toHaveLength(7);
    // index 6 is today (2026-07-24) -> true; index 4 is 2026-07-22 -> true
    expect(streak.last7Days[6]).toBe(true);
    expect(streak.last7Days[4]).toBe(true);
    expect(streak.last7Days[5]).toBe(false);
  });
});

describe("toTodayStats", () => {
  it("assembles TodayStats from profile + streak + pointsToday", () => {
    const streak = { currentStreak: 4, longestStreak: 9, last7Days: [false, false, false, false, false, false, true] };
    const result = toTodayStats(fixtureRow, streak, 35, "Chơi 2 hoạt động");
    expect(result).toEqual({
      pointsToday: 35,
      level: 3,
      xp: 40,
      xpToNextLevel: 100,
      streak,
      questTitle: "Chơi 2 hoạt động",
    });
  });
});
