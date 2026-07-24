import { z } from "zod";

// Matches social/reactions.ts's REACTION_KINDS ids exactly, and the
// `reactions.reaction_id` check constraint in
// supabase/migrations/20260724000007_social.sql.
export const reactionIdSchema = z.enum(["thich", "cuoi", "dinh", "bat-ngo", "vo-tri"]);

export const reactSchema = z.object({
  targetType: z.enum(["feed_item", "comment"]),
  targetId: z.string().uuid(),
  reactionId: reactionIdSchema,
});

// 1-1000 matches the `comments.body` check constraint exactly — the
// server rejecting a longer comment than the DB would accept anyway is
// the point (fail with a clear message before the DB does with a cryptic one).
export const postCommentSchema = z.object({
  targetType: z.enum(["activity", "feed_item"]),
  targetId: z.string().min(1),
  parentCommentId: z.string().uuid().optional(),
  body: z.string().trim().min(1, "Bình luận không được để trống.").max(1000),
});

export type ReactInput = z.infer<typeof reactSchema>;
export type PostCommentInput = z.infer<typeof postCommentSchema>;
