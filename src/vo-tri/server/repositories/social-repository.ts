import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;
type ReactionTargetType = Database["public"]["Tables"]["reactions"]["Row"]["target_type"];
type CommentTargetType = Database["public"]["Tables"]["comments"]["Row"]["target_type"];

export function toggleFollow(client: Client, targetId: string) {
  return client.rpc("toggle_follow", { p_target_id: targetId });
}

export function isFollowing(client: Client, followerId: string, followeeId: string) {
  return client.from("follows").select("follower_id").eq("follower_id", followerId).eq("followee_id", followeeId).maybeSingle();
}

export function upsertReaction(
  client: Client,
  row: Database["public"]["Tables"]["reactions"]["Insert"],
) {
  return client.from("reactions").upsert(row, { onConflict: "user_id,target_type,target_id" }).select().single();
}

export function removeReaction(client: Client, userId: string, targetType: ReactionTargetType, targetId: string) {
  return client.from("reactions").delete().eq("user_id", userId).eq("target_type", targetType).eq("target_id", targetId);
}

export function getReactionCounts(client: Client, targetType: ReactionTargetType, targetId: string) {
  // Supabase JS has no native GROUP BY — a plain `select` + service-side
  // tally is simpler than a Postgres view for this small a query;
  // revisit only if a target ever has enough reactions for this to matter.
  return client.from("reactions").select("reaction_id").eq("target_type", targetType).eq("target_id", targetId);
}

export function listComments(client: Client, targetType: CommentTargetType, targetId: string) {
  return client
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
}

export function insertComment(client: Client, row: Database["public"]["Tables"]["comments"]["Insert"]) {
  return client.from("comments").insert(row).select("*, author:profiles(*)").single();
}

export function softDeleteComment(client: Client, id: string) {
  return client.from("comments").update({ deleted_at: new Date().toISOString() }).eq("id", id);
}

export function listRecentFeedItems(client: Client, limit: number) {
  return client.from("feed_items").select("*, actor:profiles(*)").order("created_at", { ascending: false }).limit(limit);
}
