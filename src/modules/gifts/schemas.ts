import { z } from "zod";

export const createGiftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(10_000),
});
export type CreateGiftInput = z.infer<typeof createGiftSchema>;

export const updateGiftSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    message: z.string().trim().min(1).max(10_000).optional(),
    themeId: z.string().min(1).max(100).optional(),
    effectId: z.string().min(1).max(100).optional(),
    musicId: z.string().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });
export type UpdateGiftInput = z.infer<typeof updateGiftSchema>;

// Media isn't wired up until Milestone 6 (Media & Themes): `mediaAssetId` is
// only shape-validated here, not yet checked against a real MediaAsset row
// or counted against the per-tier image quota in CLAUDE.md.
const textBlockContentSchema = z.object({
  text: z.string().trim().min(1).max(5_000),
});

const imageBlockContentSchema = z.object({
  mediaAssetId: z.string().min(1),
  caption: z.string().trim().max(300).optional(),
});

const galleryBlockContentSchema = z.object({
  items: z
    .array(
      z.object({
        mediaAssetId: z.string().min(1),
        caption: z.string().trim().max(300).optional(),
      }),
    )
    .min(1)
    .max(20),
});

export const blockContentSchemas = {
  TEXT: textBlockContentSchema,
  IMAGE: imageBlockContentSchema,
  GALLERY: galleryBlockContentSchema,
} as const;

export type GiftBlockKind = keyof typeof blockContentSchemas;

export const createBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("TEXT"), content: textBlockContentSchema }),
  z.object({ type: z.literal("IMAGE"), content: imageBlockContentSchema }),
  z.object({ type: z.literal("GALLERY"), content: galleryBlockContentSchema }),
]);
export type CreateBlockInput = z.infer<typeof createBlockSchema>;

export const updateBlockSchema = z.object({
  content: z.unknown(),
});
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;

export const reorderBlocksSchema = z.object({
  orderedBlockIds: z.array(z.string().min(1)).min(1),
});
export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>;
