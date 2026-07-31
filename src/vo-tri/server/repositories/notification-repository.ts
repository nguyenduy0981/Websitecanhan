import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

export function listNotifications(client: Client, userId: string, limit: number) {
  return client.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
}

export function markNotificationRead(client: Client, id: string) {
  return client.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}
