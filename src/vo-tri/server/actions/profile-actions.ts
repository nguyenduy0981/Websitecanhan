"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as profileService from "@/vo-tri/server/services/profile-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { UpdateProfileInput } from "@/vo-tri/server/validation/profile";
import type { ProfileIdentity, ProfileStats, LevelProgress } from "@/vo-tri/profile/types";
import type { StreakData } from "@/vo-tri/retention/types";
import type { TodayStats } from "@/vo-tri/home/TodayCard";

export async function getMyProfileAction(): Promise<ServiceResult<ProfileIdentity>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return profileService.getProfileIdentity(auth.client, auth.userId);
}

export async function getMyProfileStatsAction(): Promise<ServiceResult<ProfileStats>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return profileService.getProfileStats(auth.client, auth.userId);
}

export async function getMyLevelProgressAction(): Promise<ServiceResult<LevelProgress>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return profileService.getLevelProgress(auth.client, auth.userId);
}

export async function getMyStreakDataAction(): Promise<ServiceResult<StreakData>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return profileService.getStreakData(auth.client, auth.userId);
}

export async function getMyTodayStatsAction(questTitle?: string): Promise<ServiceResult<TodayStats>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return profileService.getTodayStats(auth.client, auth.userId, questTitle);
}

export async function updateProfileAction(input: UpdateProfileInput): Promise<ServiceResult<ProfileIdentity>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await profileService.updateProfile(auth.client, auth.userId, input);
  if (result.ok) revalidatePath("/profile");
  return result;
}
