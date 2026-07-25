import type { SupabaseClient } from "@supabase/supabase-js";
import { toBadge, toCollectionItem, toJourneyEvent, toUnlockedAchievement } from "@/vo-tri/server/adapters/unlocks";
import { mapSupabaseError, ok, type ServiceResult } from "@/vo-tri/server/errors";
import {
  listAllBadgesWithUnlockStatus,
  listAllCollectionItemsWithUnlockStatus,
  listJourneyEvents as listJourneyEventsRows,
  listUnlockedAchievements,
} from "@/vo-tri/server/repositories/unlocks-repository";
import { achievementCatalog } from "@/vo-tri/profile/achievements";
import { badgeCatalog } from "@/vo-tri/profile/badges";
import { collectionCatalog } from "@/vo-tri/profile/collection";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { Achievement, CollectionItem, JourneyEvent, ProfileBadge } from "@/vo-tri/profile/types";

type Client = SupabaseClient<Database>;

export async function getAchievements(client: Client, userId: string): Promise<ServiceResult<Achievement[]>> {
  const { data, error } = await listUnlockedAchievements(client, userId);
  if (error) return mapSupabaseError(error);

  const achievements = (data ?? [])
    .map((row) => toUnlockedAchievement(row, achievementCatalog))
    .filter((a): a is Achievement => a !== null);
  return ok(achievements);
}

export async function getBadges(client: Client, userId: string): Promise<ServiceResult<ProfileBadge[]>> {
  const { data, error } = await listAllBadgesWithUnlockStatus(client, userId);
  if (error) return mapSupabaseError(error);

  const unlockedById = new Map((data ?? []).map((row) => [row.id, row.user_badges]));
  const badges = badgeCatalog.map((def) => toBadge(def, unlockedById.get(def.id) ?? []));
  return ok(badges);
}

export async function getCollectionItems(client: Client, userId: string): Promise<ServiceResult<CollectionItem[]>> {
  const { data, error } = await listAllCollectionItemsWithUnlockStatus(client, userId);
  if (error) return mapSupabaseError(error);

  const unlockedById = new Map((data ?? []).map((row) => [row.id, row.user_collection_items]));
  const items = collectionCatalog.map((def) => toCollectionItem(def, unlockedById.get(def.id) ?? []));
  return ok(items);
}

export async function getJourneyEvents(client: Client, userId: string, limit = 20): Promise<ServiceResult<JourneyEvent[]>> {
  const { data, error } = await listJourneyEventsRows(client, userId, limit);
  if (error) return mapSupabaseError(error);
  return ok((data ?? []).map(toJourneyEvent));
}
