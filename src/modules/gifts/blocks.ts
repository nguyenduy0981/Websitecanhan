import type { GiftBlock } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { assertMediaOwned, assertMediaListOwned, deleteMediaAsset } from "@/modules/media";
import { getGiftForOwner, assertEditable } from "./authorization";
import { blockContentSchemas } from "./schemas";
import type { CreateBlockInput, ReorderBlocksInput } from "./schemas";

/** IMAGE/GALLERY block content already shape-validated by zod at this point. */
async function assertBlockMediaOwned(
  type: GiftBlock["type"],
  content: CreateBlockInput["content"],
  ownerId: string,
): Promise<void> {
  if (type === "IMAGE" && "mediaAssetId" in content) {
    await assertMediaOwned(content.mediaAssetId, ownerId);
  } else if (type === "GALLERY" && "items" in content) {
    await assertMediaListOwned(
      content.items.map((item) => item.mediaAssetId),
      ownerId,
    );
  }
}

/** Best-effort: removes any MediaAsset(s) an IMAGE/GALLERY block referenced. */
async function releaseBlockMedia(block: GiftBlock, ownerId: string): Promise<void> {
  const content = block.content as { mediaAssetId?: string; items?: { mediaAssetId: string }[] };
  const mediaAssetIds =
    block.type === "IMAGE" && content.mediaAssetId
      ? [content.mediaAssetId]
      : block.type === "GALLERY" && content.items
        ? content.items.map((item) => item.mediaAssetId)
        : [];

  for (const mediaAssetId of mediaAssetIds) {
    try {
      await deleteMediaAsset(mediaAssetId, ownerId);
    } catch (error) {
      logger.warn({ err: error, mediaAssetId }, "failed to release block media (non-fatal)");
    }
  }
}

// Keeps temporary reorder positions clear of any real position value —
// see reorderBlocks for why this two-phase shift is needed.
const REORDER_TEMP_OFFSET = 1_000_000;

export async function listBlocks(giftId: string, ownerId: string): Promise<GiftBlock[]> {
  await getGiftForOwner(giftId, ownerId);
  return prisma.giftBlock.findMany({ where: { giftId }, orderBy: { position: "asc" } });
}

export async function addBlock(
  giftId: string,
  ownerId: string,
  input: CreateBlockInput,
): Promise<GiftBlock> {
  const gift = await getGiftForOwner(giftId, ownerId);
  assertEditable(gift);
  await assertBlockMediaOwned(input.type, input.content, ownerId);

  const lastBlock = await prisma.giftBlock.findFirst({
    where: { giftId },
    orderBy: { position: "desc" },
  });
  const position = (lastBlock?.position ?? -1) + 1;

  return prisma.giftBlock.create({
    data: { giftId, type: input.type, position, content: input.content },
  });
}

async function getBlockForOwner(
  giftId: string,
  blockId: string,
  ownerId: string,
): Promise<{ gift: Awaited<ReturnType<typeof getGiftForOwner>>; block: GiftBlock }> {
  const gift = await getGiftForOwner(giftId, ownerId);
  const block = await prisma.giftBlock.findUnique({ where: { id: blockId } });
  if (!block || block.giftId !== gift.id) {
    throw new NotFoundError("Block not found");
  }
  return { gift, block };
}

export async function updateBlock(
  giftId: string,
  blockId: string,
  ownerId: string,
  content: unknown,
): Promise<GiftBlock> {
  const { gift, block } = await getBlockForOwner(giftId, blockId, ownerId);
  assertEditable(gift);

  const schema = blockContentSchemas[block.type];
  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    throw new ValidationError(`Invalid content for a ${block.type} block`);
  }

  await assertBlockMediaOwned(block.type, parsed.data as CreateBlockInput["content"], ownerId);

  return prisma.giftBlock.update({ where: { id: block.id }, data: { content: parsed.data } });
}

export async function deleteBlock(
  giftId: string,
  blockId: string,
  ownerId: string,
): Promise<void> {
  const { gift, block } = await getBlockForOwner(giftId, blockId, ownerId);
  assertEditable(gift);
  await releaseBlockMedia(block, ownerId);
  await prisma.giftBlock.delete({ where: { id: block.id } });
}

export async function reorderBlocks(
  giftId: string,
  ownerId: string,
  input: ReorderBlocksInput,
): Promise<GiftBlock[]> {
  const gift = await getGiftForOwner(giftId, ownerId);
  assertEditable(gift);

  const existingBlocks = await prisma.giftBlock.findMany({ where: { giftId } });
  const existingIds = new Set(existingBlocks.map((b) => b.id));
  const requestedIds = new Set(input.orderedBlockIds);

  const sameSize = existingIds.size === requestedIds.size;
  const sameMembers = [...existingIds].every((id) => requestedIds.has(id));
  if (!sameSize || !sameMembers) {
    throw new ValidationError("orderedBlockIds must contain exactly the gift's existing blocks");
  }

  // Two-phase update: jump every block to a disjoint temp range first, then
  // assign final positions. Doing it in one pass could momentarily try to
  // give two blocks the same position and trip the
  // @@unique([giftId, position]) constraint (e.g. swapping positions 0/1).
  await prisma.$transaction([
    ...input.orderedBlockIds.map((blockId, index) =>
      prisma.giftBlock.update({
        where: { id: blockId },
        data: { position: REORDER_TEMP_OFFSET + index },
      }),
    ),
    ...input.orderedBlockIds.map((blockId, index) =>
      prisma.giftBlock.update({ where: { id: blockId }, data: { position: index } }),
    ),
  ]);

  return prisma.giftBlock.findMany({ where: { giftId }, orderBy: { position: "asc" } });
}
