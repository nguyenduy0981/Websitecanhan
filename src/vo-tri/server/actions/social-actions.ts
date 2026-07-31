"use server";

import { revalidatePath } from "next/cache";
import { getClientAndOptionalUserId, requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as socialService from "@/vo-tri/server/services/social-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { PostCommentInput, ReactInput } from "@/vo-tri/server/validation/social";
import type { CommentData, FeedItem, ReactionCounts, UserPreview } from "@/vo-tri/social/types";

export async function toggleFollowAction(targetId: string): Promise<ServiceResult<{ following: boolean }>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  // No revalidatePath here: `FollowButton` is fully controlled/optimistic
  // (caller flips its own `following` state on tap), and there's no public
  // `/profile/[username]` route yet to revalidate anyway — add one back
  // once that route exists and needs server-rendered follow state.
  return socialService.toggleFollow(auth.client, targetId);
}

export async function getMyFollowStatusAction(targetId: string): Promise<ServiceResult<boolean>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return socialService.getFollowStatus(auth.client, auth.userId, targetId);
}

export async function setReactionAction(input: ReactInput): Promise<ServiceResult<null>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return socialService.setReaction(auth.client, auth.userId, input);
}

export async function clearReactionAction(targetType: ReactInput["targetType"], targetId: string): Promise<ServiceResult<null>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return socialService.clearReaction(auth.client, auth.userId, targetType, targetId);
}

export async function getReactionCountsAction(
  targetType: ReactInput["targetType"],
  targetId: string,
): Promise<ServiceResult<ReactionCounts>> {
  const { client } = await getClientAndOptionalUserId();
  return socialService.getReactionCounts(client, targetType, targetId);
}

export async function getMyReactionAction(
  targetType: ReactInput["targetType"],
  targetId: string,
): Promise<ServiceResult<string | undefined>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return socialService.getMyReactionForTarget(auth.client, auth.userId, targetType, targetId);
}

export async function getUserPreviewAction(username: string): Promise<ServiceResult<UserPreview>> {
  const { client } = await getClientAndOptionalUserId();
  return socialService.getUserPreview(client, username);
}

export async function listCommentsAction(
  targetType: PostCommentInput["targetType"],
  targetId: string,
): Promise<ServiceResult<CommentData[]>> {
  const { client } = await getClientAndOptionalUserId();
  return socialService.listComments(client, targetType, targetId);
}

export async function postCommentAction(input: PostCommentInput): Promise<ServiceResult<CommentData>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await socialService.postComment(auth.client, auth.userId, input);
  // "/play" isn't a real route (only /play/[activityId] is) — revalidate the
  // actual page the comment was posted on: the specific activity for
  // "activity" comments, Home (where ActivityFeed renders) for "feed_item".
  if (result.ok) revalidatePath(input.targetType === "activity" ? `/play/${input.targetId}` : "/");
  return result;
}

export async function getRecentFeedAction(limit?: number): Promise<ServiceResult<FeedItem[]>> {
  const { client } = await getClientAndOptionalUserId();
  return socialService.getRecentFeed(client, limit);
}
