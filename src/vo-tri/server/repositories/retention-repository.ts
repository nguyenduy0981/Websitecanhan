import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

export function getQuestProgressForPeriods(client: Client, userId: string, periodKeys: string[]) {
  return client.from("quest_progress").select("*").eq("user_id", userId).in("period_key", periodKeys);
}

export function getMilestoneProgress(client: Client, userId: string) {
  return client.from("milestone_progress").select("*").eq("user_id", userId);
}

export function getAllQuestDefinitions(client: Client) {
  return client.from("quest_definitions").select("*");
}

export function getAllMilestoneDefinitions(client: Client) {
  return client.from("milestone_definitions").select("*");
}

export function claimQuest(client: Client, args: Database["public"]["Functions"]["claim_quest"]["Args"]) {
  return client.rpc("claim_quest", args).single();
}

export function claimMilestone(client: Client, args: Database["public"]["Functions"]["claim_milestone"]["Args"]) {
  return client.rpc("claim_milestone", args).single();
}
