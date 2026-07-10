import type { Gift } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, ValidationError } from "@/lib/errors";
import { activeDurationDays } from "@/config/business-rules";
import { generateSlug } from "./slug";
import { getGiftForOwner, assertEditable } from "./authorization";
import type { CreateGiftInput, UpdateGiftInput } from "./schemas";

const MAX_SLUG_ATTEMPTS = 5;
const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

export async function createGift(ownerId: string, input: CreateGiftInput): Promise<Gift> {
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      return await prisma.gift.create({
        data: {
          ownerId,
          slug: generateSlug(),
          title: input.title,
          message: input.message,
        },
      });
    } catch (error) {
      // Slug collision is astronomically unlikely (72 bits of randomness)
      // but retrying on the DB's unique-constraint error is race-safe,
      // unlike a check-then-insert existence probe.
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }
  throw new Error("Failed to create gift: could not generate a unique slug");
}

export async function listGiftsForOwner(ownerId: string): Promise<Gift[]> {
  return prisma.gift.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateGift(
  giftId: string,
  ownerId: string,
  input: UpdateGiftInput,
): Promise<Gift> {
  const gift = await getGiftForOwner(giftId, ownerId);
  assertEditable(gift);

  return prisma.gift.update({
    where: { id: gift.id },
    data: input,
  });
}

export async function deleteGift(giftId: string, ownerId: string): Promise<void> {
  const gift = await getGiftForOwner(giftId, ownerId);
  if (gift.status !== "DRAFT") {
    throw new ConflictError(
      "Only draft gifts can be deleted directly; a published gift follows the expiry/recovery lifecycle",
    );
  }
  await prisma.gift.delete({ where: { id: gift.id } });
}

export async function publishGift(giftId: string, ownerId: string): Promise<Gift> {
  const gift = await getGiftForOwner(giftId, ownerId);

  if (gift.status !== "DRAFT") {
    throw new ConflictError("Only a draft gift can be published");
  }

  const blockCount = await prisma.giftBlock.count({ where: { giftId: gift.id } });
  if (blockCount === 0) {
    throw new ValidationError("Add at least one block before publishing");
  }

  const now = new Date();
  const activeExpiresAt = new Date(
    now.getTime() + activeDurationDays(gift.tier) * 24 * 60 * 60 * 1000,
  );

  return prisma.gift.update({
    where: { id: gift.id },
    data: {
      status: "ACTIVE",
      publishedAt: now,
      activeExpiresAt,
      statusChangedAt: now,
    },
  });
}
