"use server";

import { getClientAndOptionalUserId, requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as leaderboardService from "@/vo-tri/server/services/leaderboard-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { LeaderboardPlayer, MyPosition } from "@/vo-tri/leaderboard/types";

/** Public read — RLS lets `anon` see `profiles.points` too, so the leaderboard itself works for logged-out visitors. */
export async function getGlobalLeaderboardAction(limit?: number): Promise<ServiceResult<LeaderboardPlayer[]>> {
  const { client } = await getClientAndOptionalUserId();
  return leaderboardService.getGlobalLeaderboard(client, limit);
}

export async function getMyGlobalPositionAction(): Promise<ServiceResult<MyPosition>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return leaderboardService.getMyGlobalPosition(auth.client, auth.userId);
}
