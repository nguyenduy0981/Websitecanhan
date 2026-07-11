import { randomBytes } from "node:crypto";
import type { GiftTier, MediaAsset } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { QUOTAS } from "@/config/business-rules";
import { validateAndProcessImage } from "./image-processing";
import { putObject, deleteObject, publicUrlFor } from "./storage";

function maxImagesFor(tier: GiftTier): number {
  return tier === "VIP" ? QUOTAS.VIP_MAX_IMAGES_PER_GIFT : QUOTAS.FREE_MAX_IMAGES_PER_GIFT;
}

function generateStorageKey(giftId: string): string {
  return `gifts/${giftId}/${randomBytes(9).toString("base64url")}.webp`;
}

export interface UploadedMedia {
  id: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Uploads and links an image to a gift. Callers (the API route) must have
 * already verified the caller owns `giftId` and that the gift is in an
 * editable status — kept out of this module to avoid a circular
 * dependency (gifts/blocks.ts also depends on this module, to validate
 * that a block's mediaAssetId is owned by the same user).
 */
export async function uploadImageForGift(
  ownerId: string,
  giftId: string,
  giftTier: GiftTier,
  fileBuffer: Buffer,
): Promise<UploadedMedia> {
  const existingCount = await prisma.mediaAsset.count({
    where: { giftId, status: "READY" },
  });
  const limit = maxImagesFor(giftTier);
  if (existingCount >= limit) {
    throw new ValidationError(
      `This gift already has the maximum of ${limit} images for its plan`,
    );
  }

  const processed = await validateAndProcessImage(fileBuffer);
  const storageKey = generateStorageKey(giftId);
  await putObject(storageKey, processed.buffer, processed.mimeType);

  const asset = await prisma.mediaAsset.create({
    data: {
      ownerId,
      giftId,
      status: "READY",
      storageKey,
      variants: { full: storageKey },
      mimeType: processed.mimeType,
      bytes: processed.buffer.byteLength,
      width: processed.width,
      height: processed.height,
    },
  });

  return {
    id: asset.id,
    url: publicUrlFor(asset.storageKey),
    width: processed.width,
    height: processed.height,
  };
}

/**
 * Batched id -> public URL lookup, for rendering already-created IMAGE/
 * GALLERY blocks (e.g. loading the editor or the public viewer). Silently
 * omits ids it can't resolve (missing asset, or R2 not configured) rather
 * than throwing, since a broken image thumbnail is preferable to a failed
 * page load.
 */
export async function getMediaUrlsByIds(mediaAssetIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(mediaAssetIds)];
  if (uniqueIds.length === 0) return {};

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, storageKey: true },
  });

  const urls: Record<string, string> = {};
  for (const asset of assets) {
    try {
      urls[asset.id] = publicUrlFor(asset.storageKey);
    } catch {
      // R2 not configured — omit rather than fail the whole page.
    }
  }
  return urls;
}

async function getOwnedMediaAsset(mediaAssetId: string, ownerId: string): Promise<MediaAsset> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId } });
  if (!asset || asset.ownerId !== ownerId) {
    throw new NotFoundError("Media asset not found");
  }
  return asset;
}

/** Used by the gifts module to validate an IMAGE block's mediaAssetId belongs to the same owner. */
export async function assertMediaOwned(mediaAssetId: string, ownerId: string): Promise<void> {
  await getOwnedMediaAsset(mediaAssetId, ownerId);
}

/** Same as assertMediaOwned, batched for a GALLERY block's list of items. */
export async function assertMediaListOwned(mediaAssetIds: string[], ownerId: string): Promise<void> {
  const uniqueIds = [...new Set(mediaAssetIds)];
  const owned = await prisma.mediaAsset.findMany({
    where: { id: { in: uniqueIds }, ownerId },
    select: { id: true },
  });
  if (owned.length !== uniqueIds.length) {
    throw new NotFoundError("One or more media assets were not found");
  }
}

/**
 * Deletes a media asset's storage object and DB row. Used when a block
 * referencing it is deleted, so a deliberate delete frees up the owner's
 * image quota immediately rather than waiting on the future orphan-cleanup
 * background job (Milestone 7), which targets abandoned uploads instead.
 */
export async function deleteMediaAsset(mediaAssetId: string, ownerId: string): Promise<void> {
  const asset = await getOwnedMediaAsset(mediaAssetId, ownerId);

  try {
    await deleteObject(asset.storageKey);
  } catch (error) {
    logger.warn({ err: error, mediaAssetId }, "failed to delete storage object (non-fatal)");
  }

  await prisma.mediaAsset.delete({ where: { id: asset.id } });
}
