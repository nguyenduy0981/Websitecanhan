import { describe, expect, it } from "vitest";
import { toCommentTree, toFeedItem, toNotificationItem, toReactionCounts, toUserPreview } from "./social";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type FeedItemRow = Database["public"]["Tables"]["feed_items"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

const actor = { display_name: "Bé Vô Tri", avatar_url: null, username: "be_vo_tri", level: 5 } as ProfileRow;

describe("toFeedItem", () => {
  it("maps a feed row + its joined actor profile", () => {
    const row = { id: "f1", text: "Bé Vô Tri vừa đạt cấp độ 5", created_at: "2026-07-24T00:00:00.000Z" } as FeedItemRow;
    const result = toFeedItem(row, actor);
    expect(result).toEqual({
      id: "f1",
      actor: { name: "Bé Vô Tri", avatarUrl: undefined },
      text: "Bé Vô Tri vừa đạt cấp độ 5",
      createdAt: new Date("2026-07-24T00:00:00.000Z"),
    });
  });
});

describe("toNotificationItem", () => {
  it("maps read_at presence to read: boolean", () => {
    const unread = { id: "n1", type: "reward", title: "T", description: "D", read_at: null, created_at: "2026-07-24T00:00:00.000Z" } as NotificationRow;
    expect(toNotificationItem(unread).read).toBe(false);

    const read = { ...unread, read_at: "2026-07-24T01:00:00.000Z" } as NotificationRow;
    expect(toNotificationItem(read).read).toBe(true);
  });
});

describe("toUserPreview", () => {
  it("derives badgeLabel from level", () => {
    expect(toUserPreview(actor)).toEqual({
      name: "Bé Vô Tri",
      username: "be_vo_tri",
      avatarUrl: undefined,
      level: 5,
      badgeLabel: "Kỳ Cựu", // level 5 -> Kỳ Cựu per ranks.ts
    });
  });
});

describe("toReactionCounts", () => {
  it("builds a { [reactionId]: count } map from grouped rows", () => {
    expect(toReactionCounts([{ reaction_id: "vo-tri", count: 3 }, { reaction_id: "thich", count: 1 }])).toEqual({
      "vo-tri": 3,
      thich: 1,
    });
  });

  it("returns an empty object for no rows", () => {
    expect(toReactionCounts([])).toEqual({});
  });
});

describe("toCommentTree", () => {
  it("nests one level of replies under their parent, keeps unrelated comments top-level", () => {
    const rows: (CommentRow & { author: ProfileRow })[] = [
      {
        id: "c1",
        target_type: "activity",
        target_id: "diem-danh",
        author_id: "u1",
        parent_comment_id: null,
        body: "Hay đấy",
        created_at: "2026-07-24T00:00:00.000Z",
        deleted_at: null,
        author: actor,
      },
      {
        id: "c2",
        target_type: "activity",
        target_id: "diem-danh",
        author_id: "u2",
        parent_comment_id: "c1",
        body: "Đồng ý",
        created_at: "2026-07-24T00:05:00.000Z",
        deleted_at: null,
        author: actor,
      },
      {
        id: "c3",
        target_type: "activity",
        target_id: "diem-danh",
        author_id: "u1",
        parent_comment_id: null,
        body: "Bình luận khác",
        created_at: "2026-07-24T00:10:00.000Z",
        deleted_at: null,
        author: actor,
      },
    ];

    const tree = toCommentTree(rows);
    expect(tree).toHaveLength(2);
    expect(tree[0]!.id).toBe("c1");
    expect(tree[0]!.replies).toHaveLength(1);
    expect(tree[0]!.replies![0]!.id).toBe("c2");
    expect(tree[1]!.id).toBe("c3");
    expect(tree[1]!.replies).toBeUndefined();
  });
});
