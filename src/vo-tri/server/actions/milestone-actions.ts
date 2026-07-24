"use server";

import { revalidatePath } from "next/cache";
import { getClientAndOptionalUserId, requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as retentionService from "@/vo-tri/server/services/retention-service";
import { fail, type ServiceResult } from "@/vo-tri/server/errors";
import type { ClaimResult } from "@/vo-tri/retention/types";

export async function getMyMilestoneMetricsAction(): Promise<ServiceResult<{ streak: number; activitiesPlayed: number }>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return retentionService.getMilestoneMetricValues(client, userId);
}

export async function claimMilestoneAction(milestoneId: string): Promise<ServiceResult<ClaimResult>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await retentionService.claimMilestone(auth.client, milestoneId);
  if (result.ok) revalidatePath("/profile");
  return result;
}
