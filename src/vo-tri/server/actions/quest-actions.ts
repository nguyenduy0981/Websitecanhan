"use server";

import { revalidatePath } from "next/cache";
import { getClientAndOptionalUserId, requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as retentionService from "@/vo-tri/server/services/retention-service";
import { fail, type ServiceResult } from "@/vo-tri/server/errors";
import type { ClaimResult, QuestProgress } from "@/vo-tri/retention/types";

export async function getMyQuestProgressAction(periodKeys: string[]): Promise<ServiceResult<Record<string, QuestProgress>>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return retentionService.getQuestProgressMap(client, userId, periodKeys);
}

export async function claimQuestAction(questId: string, periodKey: string): Promise<ServiceResult<ClaimResult>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await retentionService.claimQuest(auth.client, questId, periodKey);
  if (result.ok) revalidatePath("/");
  return result;
}
