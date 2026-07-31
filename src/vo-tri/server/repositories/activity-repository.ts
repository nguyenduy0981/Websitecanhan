import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

/** Wraps the record_activity_session() RPC — see docs/BACKEND_ARCHITECTURE.md §6.2/§7. */
export function recordActivitySession(
  client: Client,
  args: Database["public"]["Functions"]["record_activity_session"]["Args"],
) {
  return client.rpc("record_activity_session", args).single();
}

export function getActivityCatalogEntry(client: Client, activityId: string) {
  return client.from("activities").select("*").eq("id", activityId).maybeSingle();
}
