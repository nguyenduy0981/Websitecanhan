import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

/**
 * Thin Supabase query wrappers only — no business logic, no adapting to
 * frontend shapes (that's services/profile-service.ts). Each function
 * takes the client as a parameter rather than constructing its own, so
 * the caller decides which client (cookie-scoped vs. admin) and this
 * stays trivially testable with a fake client later. See
 * docs/BACKEND_ARCHITECTURE.md §9.2.
 */

export function getProfileById(client: Client, id: string) {
  return client.from("profiles").select("*").eq("id", id).maybeSingle();
}

export function getProfileByUsername(client: Client, username: string) {
  return client.from("profiles").select("*").eq("username", username).maybeSingle();
}

export function updateProfileRow(client: Client, id: string, values: { display_name: string; tagline: string | null }) {
  return client.from("profiles").update(values).eq("id", id).select().single();
}

/** Active dates in the last N days (default 7) — backs StreakData.last7Days. */
export function getRecentActiveDates(client: Client, userId: string, sinceDateIso: string) {
  return client.from("daily_activity_log").select("activity_date").eq("user_id", userId).gte("activity_date", sinceDateIso);
}

/** Sum of today's awarded_points — backs TodayStats.pointsToday. */
export function getTodayAwardedPoints(client: Client, userId: string, todayStartIso: string) {
  return client.from("activity_sessions").select("awarded_points").eq("user_id", userId).gte("created_at", todayStartIso);
}
