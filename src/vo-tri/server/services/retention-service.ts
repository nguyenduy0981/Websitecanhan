import type { SupabaseClient } from "@supabase/supabase-js";
import { toQuestProgress } from "@/vo-tri/server/adapters/quest";
import { fail, mapSupabaseError, ok, type ServiceResult } from "@/vo-tri/server/errors";
import {
  claimMilestone as claimMilestoneRpc,
  claimQuest as claimQuestRpc,
  getQuestProgressForPeriods,
} from "@/vo-tri/server/repositories/retention-repository";
import { getProfileById } from "@/vo-tri/server/repositories/profile-repository";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { ClaimResult, QuestProgress } from "@/vo-tri/retention/types";

type Client = SupabaseClient<Database>;

/**
 * Keyed by quest_id so a page can do `progress={progressMap[quest.id]}`
 * per `QuestCard` without the service needing to know about the frontend
 * catalog (`retention/quests.ts`) at all — that catalog stays the page's
 * own import, same pattern as `DailyQuestPreview` today.
 */
export async function getQuestProgressMap(
  client: Client,
  userId: string,
  periodKeys: string[],
): Promise<ServiceResult<Record<string, QuestProgress>>> {
  const { data, error } = await getQuestProgressForPeriods(client, userId, periodKeys);
  if (error) return mapSupabaseError(error);

  const map: Record<string, QuestProgress> = {};
  for (const row of data ?? []) {
    map[row.quest_id] = toQuestProgress(row);
  }
  return ok(map);
}

/** Live counters `MilestoneTrack` needs directly — see docs/BACKEND_ARCHITECTURE.md §4.4 on why these aren't stored per-milestone. */
export async function getMilestoneMetricValues(
  client: Client,
  userId: string,
): Promise<ServiceResult<{ streak: number; activitiesPlayed: number }>> {
  const { data, error } = await getProfileById(client, userId);
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");
  return ok({ streak: data.current_streak, activitiesPlayed: data.total_activities_played });
}

export async function claimQuest(client: Client, questId: string, periodKey: string): Promise<ServiceResult<ClaimResult>> {
  const { data, error } = await claimQuestRpc(client, { p_quest_id: questId, p_period_key: periodKey });
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");

  return ok({
    points: data.points,
    xp: data.xp,
    leveledUp: data.leveled_up ? { newLevel: data.new_level } : undefined,
  });
}

export async function claimMilestone(client: Client, milestoneId: string): Promise<ServiceResult<ClaimResult>> {
  const { data, error } = await claimMilestoneRpc(client, { p_milestone_id: milestoneId });
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");

  return ok({ points: data.points, xp: data.xp });
}
