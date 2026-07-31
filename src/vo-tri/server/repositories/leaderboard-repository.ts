import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

/**
 * "Global, all-time" needs no window function — just order + limit, with
 * rank derived as `offset + index + 1` in the service layer (see
 * docs/BACKEND_ARCHITECTURE.md §10 — a materialized view/snapshot table
 * is deliberately not built yet, there's no real traffic to justify it).
 */
export function getTopProfilesByPoints(client: Client, limit: number) {
  return client.from("profiles").select("*").order("points", { ascending: false }).limit(limit);
}

/** How many profiles rank strictly above this point total — `rank = count + 1`. */
export function countProfilesAbove(client: Client, points: number) {
  return client.from("profiles").select("*", { count: "exact", head: true }).gt("points", points);
}

/** The closest profile still ahead, for MyPosition.gapToNext. */
export function getNextHigherProfile(client: Client, points: number) {
  return client.from("profiles").select("points").gt("points", points).order("points", { ascending: true }).limit(1).maybeSingle();
}

export function getMostRecentSnapshotsForScope(client: Client, scope: Database["public"]["Tables"]["leaderboard_rank_snapshots"]["Row"]["scope"]) {
  return client.from("leaderboard_rank_snapshots").select("*").eq("scope", scope).order("captured_at", { ascending: false });
}
