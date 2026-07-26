"use server";

import { requireAuthenticatedClient } from "@/vo-tri/server/require-auth";
import * as unlocksService from "@/vo-tri/server/services/unlocks-service";
import { ok, type ServiceResult } from "@/vo-tri/server/errors";
import type { JourneyEvent } from "@/vo-tri/profile/types";

/**
 * A Server Action's return value crosses the same RSC Flight-protocol
 * boundary as a Server Component prop passed to a Client Component —
 * `Achievement`/`ProfileBadge`/`CollectionItem` all carry `icon:
 * LucideIcon` (a component reference), which cannot serialize across it.
 * `unlocks-service.ts`'s functions return those full types safely today
 * because their only real caller is `/profile/page.tsx`, a Server
 * Component with no "use client" children in between — no boundary is
 * ever crossed there. These "use server" actions are a *different*
 * caller shape (built for a future client-initiated fetch), so they
 * strip `icon`/`name`/`description`/`rarity`/`kind` down to just the
 * per-user facts (`id` + unlock state), matching the same "id crosses
 * the wire, catalog lookup happens client-side" fix already used for
 * `ClaimResult.milestoneReached` and `DailyQuestPreview`.
 */
export interface AchievementUnlockDTO {
  id: string;
  unlockedAt: Date;
}

export interface BadgeUnlockDTO {
  id: string;
  unlocked: boolean;
}

export interface CollectionUnlockDTO {
  id: string;
  unlocked: boolean;
}

export async function getMyAchievementsAction(): Promise<ServiceResult<AchievementUnlockDTO[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await unlocksService.getAchievements(auth.client, auth.userId);
  if (!result.ok) return result;
  return ok(result.data.map((a) => ({ id: a.id, unlockedAt: a.unlockedAt })));
}

export async function getMyBadgesAction(): Promise<ServiceResult<BadgeUnlockDTO[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await unlocksService.getBadges(auth.client, auth.userId);
  if (!result.ok) return result;
  return ok(result.data.map((b) => ({ id: b.id, unlocked: b.unlocked })));
}

export async function getMyCollectionAction(): Promise<ServiceResult<CollectionUnlockDTO[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;

  const result = await unlocksService.getCollectionItems(auth.client, auth.userId);
  if (!result.ok) return result;
  return ok(result.data.map((c) => ({ id: c.id, unlocked: c.unlocked })));
}

/** JourneyEvent carries no icon (JourneyTimeline maps its `type` enum to an icon internally) — safe to return as-is. */
export async function getMyJourneyAction(limit?: number): Promise<ServiceResult<JourneyEvent[]>> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return auth.error;
  return unlocksService.getJourneyEvents(auth.client, auth.userId, limit);
}
