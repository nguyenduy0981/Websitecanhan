import type { SupabaseClient } from "@supabase/supabase-js";
import { toLevelProgress, toProfileIdentity, toProfileStats, toStreakData, toTodayStats } from "@/vo-tri/server/adapters/profile";
import { fail, mapSupabaseError, ok, validationFail, type ServiceResult } from "@/vo-tri/server/errors";
import {
  getProfileById,
  getProfileByUsername,
  getRecentActiveDates,
  getTodayAwardedPoints,
  updateProfileRow,
} from "@/vo-tri/server/repositories/profile-repository";
import { updateProfileSchema, type UpdateProfileInput } from "@/vo-tri/server/validation/profile";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { ProfileIdentity, ProfileStats, LevelProgress } from "@/vo-tri/profile/types";
import type { StreakData } from "@/vo-tri/retention/types";
import type { TodayStats } from "@/vo-tri/home/TodayCard";

type Client = SupabaseClient<Database>;

async function fetchProfileRow(client: Client, userId: string) {
  const { data, error } = await getProfileById(client, userId);
  if (error) return { row: null, result: mapSupabaseError(error) } as const;
  if (!data) return { row: null, result: fail("generic") } as const;
  return { row: data, result: null } as const;
}

export async function getProfileIdentity(client: Client, userId: string): Promise<ServiceResult<ProfileIdentity>> {
  const { row, result } = await fetchProfileRow(client, userId);
  if (!row) return result;
  return ok(toProfileIdentity(row));
}

export async function getProfileIdentityByUsername(client: Client, username: string): Promise<ServiceResult<ProfileIdentity>> {
  const { data, error } = await getProfileByUsername(client, username);
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");
  return ok(toProfileIdentity(data));
}

export async function getProfileStats(client: Client, userId: string): Promise<ServiceResult<ProfileStats>> {
  const { row, result } = await fetchProfileRow(client, userId);
  if (!row) return result;
  return ok(toProfileStats(row));
}

export async function getLevelProgress(client: Client, userId: string): Promise<ServiceResult<LevelProgress>> {
  const { row, result } = await fetchProfileRow(client, userId);
  if (!row) return result;
  return ok(toLevelProgress(row));
}

export async function getStreakData(client: Client, userId: string): Promise<ServiceResult<StreakData>> {
  const { row, result } = await fetchProfileRow(client, userId);
  if (!row) return result;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 6);
  const { data: activeDateRows, error } = await getRecentActiveDates(client, userId, since.toISOString().slice(0, 10));
  if (error) return mapSupabaseError(error);

  const activeDates = new Set((activeDateRows ?? []).map((r) => r.activity_date));
  return ok(toStreakData(row, activeDates));
}

export async function getTodayStats(client: Client, userId: string, questTitle?: string): Promise<ServiceResult<TodayStats>> {
  const { row, result } = await fetchProfileRow(client, userId);
  if (!row) return result;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 6);
  const { data: activeDateRows, error: activeError } = await getRecentActiveDates(client, userId, since.toISOString().slice(0, 10));
  if (activeError) return mapSupabaseError(activeError);
  const activeDates = new Set((activeDateRows ?? []).map((r) => r.activity_date));
  const streak = toStreakData(row, activeDates);

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { data: todaySessions, error: todayError } = await getTodayAwardedPoints(client, userId, todayStart.toISOString());
  if (todayError) return mapSupabaseError(todayError);
  const pointsToday = (todaySessions ?? []).reduce((sum, s) => sum + s.awarded_points, 0);

  return ok(toTodayStats(row, streak, pointsToday, questTitle));
}

export async function updateProfile(client: Client, userId: string, input: UpdateProfileInput): Promise<ServiceResult<ProfileIdentity>> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await updateProfileRow(client, userId, {
    display_name: parsed.data.displayName,
    tagline: parsed.data.tagline || null,
  });
  if (error) return mapSupabaseError(error);
  return ok(toProfileIdentity(data));
}
