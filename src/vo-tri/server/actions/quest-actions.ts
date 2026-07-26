"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as retentionService from "@/vo-tri/server/services/retention-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { ClaimResult, QuestProgress } from "@/vo-tri/retention/types";

export async function getMyQuestProgressAction(periodKeys: string[]): Promise<ServiceResult<Record<string, QuestProgress>>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return retentionService.getQuestProgressMap(auth.client, auth.userId, periodKeys);
}

export async function claimQuestAction(questId: string, periodKey: string): Promise<ServiceResult<ClaimResult>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await retentionService.claimQuest(auth.client, questId, periodKey);
  if (result.ok) revalidatePath("/");
  return result;
}
