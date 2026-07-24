import type { LevelProgress, ProfileIdentity, ProfileStats } from "@/vo-tri/profile/types";
import type { StreakData } from "@/vo-tri/retention/types";
import type { TodayStats } from "@/vo-tri/home/TodayCard";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export function toProfileIdentity(row: ProfileRow): ProfileIdentity {
  return {
    displayName: row.display_name,
    username: row.username,
    avatarUrl: row.avatar_url ?? undefined,
    tagline: row.tagline ?? undefined,
    joinedAt: new Date(row.joined_at),
  };
}

export function toProfileStats(row: ProfileRow): ProfileStats {
  return {
    points: row.points,
    level: row.level,
    xp: row.xp,
    streakDays: row.current_streak,
    activeDays: row.total_active_days,
    activitiesPlayed: row.total_activities_played,
  };
}

export function toLevelProgress(row: ProfileRow): LevelProgress {
  return { level: row.level, xp: row.xp, xpToNext: row.xp_to_next };
}

/**
 * `activeDates` — the set of `daily_activity_log.activity_date` values
 * (as `YYYY-MM-DD` strings) for this user, already narrowed to roughly
 * the last 7 days by the repository query. Pure/testable without a DB:
 * pass in whatever dates you want to check against `referenceDate`.
 */
export function toStreakData(row: ProfileRow, activeDates: Set<string>, referenceDate: Date = new Date()): StreakData {
  const last7Days: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7Days.push(activeDates.has(key));
  }
  return {
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    last7Days,
  };
}

export function toTodayStats(
  row: ProfileRow,
  streak: StreakData,
  pointsToday: number,
  questTitle?: string,
): TodayStats {
  return {
    pointsToday,
    level: row.level,
    xp: row.xp,
    xpToNextLevel: row.xp_to_next,
    streak,
    questTitle,
  };
}
