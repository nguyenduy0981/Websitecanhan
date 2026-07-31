import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

/** Only the achievements this user has actually unlocked — `Achievement[]` has no "locked" concept, unlike badges/collection items. */
export function listUnlockedAchievements(client: Client, userId: string) {
  return client.from("user_achievements").select("achievement_id, unlocked_at, achievement_definitions(*)").eq("user_id", userId);
}

/** Every badge in the catalog, each with its unlock row for this user embedded if it exists (left join) — BadgeCollection shows locked ones too. */
export function listAllBadgesWithUnlockStatus(client: Client, userId: string) {
  return client.from("badge_definitions").select("*, user_badges!left(unlocked_at, user_id)").eq("user_badges.user_id", userId);
}

/** Same left-join shape as badges — CollectionShowcase shows locked items too. */
export function listAllCollectionItemsWithUnlockStatus(client: Client, userId: string) {
  return client
    .from("collection_definitions")
    .select("*, user_collection_items!left(unlocked_at, user_id)")
    .eq("user_collection_items.user_id", userId);
}

export function listJourneyEvents(client: Client, userId: string, limit: number) {
  return client.from("journey_events").select("*").eq("user_id", userId).order("occurred_at", { ascending: false }).limit(limit);
}
