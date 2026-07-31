"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedClient, getClientAndOptionalUserId } from "@/vo-tri/server/require-auth";
import * as courtService from "@/vo-tri/server/services/court-service";
import * as socialService from "@/vo-tri/server/services/social-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { ConsensusResult, CourtTrial, DilemmaChoice, VoteResult } from "@/vo-tri/court/types";
import type { UserPreview } from "@/vo-tri/social/types";

export async function voteDilemmaAction(dilemmaId: string, choice: DilemmaChoice): Promise<ServiceResult<VoteResult>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await courtService.voteDilemma(auth.client, { dilemmaId, choice });
  if (result.ok) revalidatePath("/");
  return result;
}

/** Works whether or not someone is signed in — the aggregate reveal is real public data, only the "have I voted" branch needs a session. */
export async function getTodayConsensusAction(dilemmaId: string): Promise<ServiceResult<ConsensusResult>> {
  const { client, userId } = await getClientAndOptionalUserId();
  return courtService.getTodayConsensus(client, dilemmaId, userId);
}

/** Who the current user follows — Court's "pick a friend to challenge" source list. */
export async function listMyFollowingAction(): Promise<ServiceResult<UserPreview[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return socialService.listFollowing(auth.client, auth.userId);
}

export async function startCourtTrialAction(targetId: string, dilemmaId: string): Promise<ServiceResult<{ trialId: string }>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await courtService.startCourtTrial(auth.client, { targetId, dilemmaId });
  if (result.ok) revalidatePath("/court");
  return result;
}

export async function submitCourtAnswerAction(
  trialId: string,
  choice: DilemmaChoice,
): Promise<ServiceResult<{ status: "pending" | "resolved"; verdict?: "initiator" | "target" | "tie" }>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await courtService.submitCourtAnswer(auth.client, { trialId, choice });
  if (result.ok) revalidatePath("/court");
  return result;
}

export async function listMyTrialsAction(): Promise<ServiceResult<CourtTrial[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return courtService.listMyTrials(auth.client, auth.userId);
}
