import type { SupabaseClient } from "@supabase/supabase-js";
import { toCommentTree, toFeedItem, toReactionCounts } from "@/vo-tri/server/adapters/social";
import { fail, mapSupabaseError, ok, validationFail, type ServiceResult } from "@/vo-tri/server/errors";
import {
  getReactionCounts as getReactionCountsRow,
  insertComment,
  isFollowing,
  listComments as listCommentsRows,
  listRecentFeedItems,
  removeReaction,
  toggleFollow as toggleFollowRpc,
  upsertReaction,
} from "@/vo-tri/server/repositories/social-repository";
import { postCommentSchema, reactSchema, type PostCommentInput, type ReactInput } from "@/vo-tri/server/validation/social";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { CommentData, FeedItem, ReactionCounts } from "@/vo-tri/social/types";

type Client = SupabaseClient<Database>;

export async function toggleFollow(client: Client, targetId: string): Promise<ServiceResult<{ following: boolean }>> {
  const { data, error } = await toggleFollowRpc(client, targetId);
  if (error) return mapSupabaseError(error);
  return ok({ following: Boolean(data) });
}

export async function getFollowStatus(client: Client, followerId: string, followeeId: string): Promise<ServiceResult<boolean>> {
  const { data, error } = await isFollowing(client, followerId, followeeId);
  if (error) return mapSupabaseError(error);
  return ok(data !== null);
}

/** "Pick one" reaction UX (ReactionBar): re-tapping the active reaction removes it, tapping a different one switches. */
export async function setReaction(client: Client, userId: string, input: ReactInput): Promise<ServiceResult<null>> {
  const parsed = reactSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { error } = await upsertReaction(client, {
    user_id: userId,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reaction_id: parsed.data.reactionId,
  });
  if (error) return mapSupabaseError(error);
  return ok(null);
}

export async function clearReaction(
  client: Client,
  userId: string,
  targetType: ReactInput["targetType"],
  targetId: string,
): Promise<ServiceResult<null>> {
  const { error } = await removeReaction(client, userId, targetType, targetId);
  if (error) return mapSupabaseError(error);
  return ok(null);
}

export async function getReactionCounts(
  client: Client,
  targetType: ReactInput["targetType"],
  targetId: string,
): Promise<ServiceResult<ReactionCounts>> {
  const { data, error } = await getReactionCountsRow(client, targetType, targetId);
  if (error) return mapSupabaseError(error);

  const tally = new Map<string, number>();
  for (const row of data ?? []) {
    tally.set(row.reaction_id, (tally.get(row.reaction_id) ?? 0) + 1);
  }
  return ok(toReactionCounts([...tally.entries()].map(([reaction_id, count]) => ({ reaction_id, count }))));
}

export async function listComments(
  client: Client,
  targetType: PostCommentInput["targetType"],
  targetId: string,
): Promise<ServiceResult<CommentData[]>> {
  const { data, error } = await listCommentsRows(client, targetType, targetId);
  if (error) return mapSupabaseError(error);
  return ok(toCommentTree(data ?? []));
}

export async function postComment(client: Client, authorId: string, input: PostCommentInput): Promise<ServiceResult<CommentData>> {
  const parsed = postCommentSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await insertComment(client, {
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    author_id: authorId,
    parent_comment_id: parsed.data.parentCommentId,
    body: parsed.data.body,
  });
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");

  return ok(toCommentTree([data])[0]!);
}

export async function getRecentFeed(client: Client, limit = 20): Promise<ServiceResult<FeedItem[]>> {
  const { data, error } = await listRecentFeedItems(client, limit);
  if (error) return mapSupabaseError(error);
  return ok((data ?? []).map((row) => toFeedItem(row, row.actor)));
}
