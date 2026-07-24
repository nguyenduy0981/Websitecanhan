"use server";

import { getClientAndOptionalUserId } from "@/vo-tri/server/require-auth";
import * as leaderboardService from "@/vo-tri/server/services/leaderboard-service";
import { fail, type ServiceResult } from "@/vo-tri/server/errors";
import type { LeaderboardPlayer, MyPosition } from "@/vo-tri/leaderboard/types";

export async function getGlobalLeaderboardAction(limit?: number): Promise<ServiceResult<LeaderboardPlayer[]>> {
  const { client } = await getClientAndOptionalUserId();
  return leaderboardService.getGlobalLeaderboard(client, limit);
}

export async function getMyGlobalPositionAction(): Promise<ServiceResult<MyPosition>> {
  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return fail("NOT_AUTHENTICATED");
  return leaderboardService.getMyGlobalPosition(client, userId);
}
