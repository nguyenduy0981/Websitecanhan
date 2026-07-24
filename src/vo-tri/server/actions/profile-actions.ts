"use server";

import { revalidatePath } from "next/cache";
import { getClientAndOptionalUserId, requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as profileService from "@/vo-tri/server/services/profile-service";
import { fail, type ServiceResult } from "@/vo-tri/server/errors";
import type { UpdateProfileInput } from "@/vo-tri/server/validation/profile";
import type { ProfileIdentity, ProfileStats, LevelProgress } from "@/vo-tri/profile/types";
import type { StreakData } from "@/vo-tri/retention/types";
import type { TodayStats } from "@/vo-tri/home/TodayCard";

export async function getMyProfileAction(): Promise<ServiceResult<ProfileIdentity>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return profileService.getProfileIdentity(client, userId);
}

export async function getMyProfileStatsAction(): Promise<ServiceResult<ProfileStats>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return profileService.getProfileStats(client, userId);
}

export async function getMyLevelProgressAction(): Promise<ServiceResult<LevelProgress>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return profileService.getLevelProgress(client, userId);
}

export async function getMyStreakDataAction(): Promise<ServiceResult<StreakData>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return profileService.getStreakData(client, userId);
}

export async function getMyTodayStatsAction(questTitle?: string): Promise<ServiceResult<TodayStats>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return profileService.getTodayStats(client, userId, questTitle);
}

export async function updateProfileAction(input: UpdateProfileInput): Promise<ServiceResult<ProfileIdentity>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await profileService.updateProfile(auth.client, auth.userId, input);
  if (result.ok) revalidatePath("/profile");
  return result;
}
