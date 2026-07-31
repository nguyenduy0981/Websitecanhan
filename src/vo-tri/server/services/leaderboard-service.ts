import type { SupabaseClient } from "@supabase/supabase-js";
import { toLeaderboardPlayer, toMyPosition } from "@/vo-tri/server/adapters/leaderboard";
import { fail, mapSupabaseError, ok, type ServiceResult } from "@/vo-tri/server/errors";
import {
  countProfilesAbove,
  getNextHigherProfile,
  getTopProfilesByPoints,
} from "@/vo-tri/server/repositories/leaderboard-repository";
import { getProfileById } from "@/vo-tri/server/repositories/profile-repository";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { LeaderboardPlayer, MyPosition } from "@/vo-tri/leaderboard/types";

type Client = SupabaseClient<Database>;

/**
 * "Global, all-time" only — the other 4 `LeaderboardScope`s (friends/week/
 * month/season) need the social graph / time-windowed aggregation this
 * Phase doesn't wire yet (see docs/BACKEND_ARCHITECTURE.md §10); the
 * frontend's `ScopeFilter` already resolves every scope to the same honest
 * empty state today, so there's no regression in leaving those for a
 * later service function once they're needed.
 */
export async function getGlobalLeaderboard(client: Client, limit = 100): Promise<ServiceResult<LeaderboardPlayer[]>> {
  const { data, error } = await getTopProfilesByPoints(client, limit);
  if (error) return mapSupabaseError(error);
  return ok((data ?? []).map((row, index) => toLeaderboardPlayer(row, index + 1)));
}

export async function getMyGlobalPosition(client: Client, userId: string): Promise<ServiceResult<MyPosition>> {
  const { data: profile, error: profileError } = await getProfileById(client, userId);
  if (profileError) return mapSupabaseError(profileError);
  if (!profile) return fail("generic");

  const { count, error: countError } = await countProfilesAbove(client, profile.points);
  if (countError) return mapSupabaseError(countError);

  const { data: nextHigher, error: nextError } = await getNextHigherProfile(client, profile.points);
  if (nextError) return mapSupabaseError(nextError);

  return ok(toMyPosition((count ?? 0) + 1, profile.points, nextHigher?.points));
}
