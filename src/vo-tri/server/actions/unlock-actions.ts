"use server";

import { getClientAndOptionalUserId } from "@/vo-tri/server/require-auth";
import * as unlocksService from "@/vo-tri/server/services/unlocks-service";
import { fail, type ServiceResult } from "@/vo-tri/server/errors";
import type { Achievement, CollectionItem, JourneyEvent, ProfileBadge } from "@/vo-tri/profile/types";

export async function getMyAchievementsAction(): Promise<ServiceResult<Achievement[]>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return unlocksService.getAchievements(client, userId);
}

export async function getMyBadgesAction(): Promise<ServiceResult<ProfileBadge[]>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return unlocksService.getBadges(client, userId);
}

export async function getMyCollectionAction(): Promise<ServiceResult<CollectionItem[]>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return unlocksService.getCollectionItems(client, userId);
}

export async function getMyJourneyAction(limit?: number): Promise<ServiceResult<JourneyEvent[]>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return unlocksService.getJourneyEvents(client, userId, limit);
}
