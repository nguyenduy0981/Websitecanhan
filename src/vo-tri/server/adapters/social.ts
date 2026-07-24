import { getRank } from "@/vo-tri/profile/ranks";
import type { CommentAuthor, CommentData, FeedItem, NotificationItem, ReactionCounts, UserPreview } from "@/vo-tri/social/types";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type FeedItemRow = Database["public"]["Tables"]["feed_items"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

function toCommentAuthor(row: ProfileRow): CommentAuthor {
  return { name: row.display_name, avatarUrl: row.avatar_url ?? undefined };
}

export function toFeedItem(row: FeedItemRow, actor: ProfileRow): FeedItem {
  return {
    id: row.id,
    actor: toCommentAuthor(actor),
    text: row.text,
    createdAt: new Date(row.created_at),
  };
}

export function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    createdAt: new Date(row.created_at),
    read: row.read_at !== null,
  };
}

export function toUserPreview(row: ProfileRow): UserPreview {
  return {
    name: row.display_name,
    username: row.username,
    avatarUrl: row.avatar_url ?? undefined,
    level: row.level,
    badgeLabel: getRank(row.level),
  };
}

export function toReactionCounts(rows: { reaction_id: string; count: number }[]): ReactionCounts {
  const counts: ReactionCounts = {};
  for (const row of rows) {
    counts[row.reaction_id] = row.count;
  }
  return counts;
}

/**
 * Builds the nested `CommentData[]` (top-level comments with `replies`)
 * `CommentSection`/`CommentItem` expect, from the flat row list a real
 * query returns (one level of nesting only, matching
 * `comments.parent_comment_id` — the frontend type technically allows
 * arbitrarily deep `replies`, but neither `CommentComposer` nor
 * `CommentItem` render past one level today, so this only nests one
 * level deep; deeper replies collapse into their top-level parent's
 * `replies` array in creation order rather than a true tree).
 */
export function toCommentTree(rows: (CommentRow & { author: ProfileRow })[]): CommentData[] {
  const topLevel: CommentData[] = [];
  const byId = new Map<string, CommentData>();

  for (const row of rows) {
    const node: CommentData = {
      id: row.id,
      author: toCommentAuthor(row.author),
      text: row.body,
      createdAt: new Date(row.created_at),
    };
    byId.set(row.id, node);
  }

  for (const row of rows) {
    const node = byId.get(row.id)!;
    if (row.parent_comment_id && byId.has(row.parent_comment_id)) {
      const parent = byId.get(row.parent_comment_id)!;
      parent.replies = [...(parent.replies ?? []), node];
    } else {
      topLevel.push(node);
    }
  }

  return topLevel;
}
