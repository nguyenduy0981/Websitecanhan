import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, mapSupabaseError, ok, type ServiceResult } from "@/vo-tri/server/errors";
import { recordActivitySession as recordActivitySessionRow } from "@/vo-tri/server/repositories/activity-repository";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

export interface RecordSessionInput {
  activityId: string;
  kind: "win" | "lose" | "complete" | "timeout" | "abandoned";
  clientReportedPoints: number;
  clientReportedXp: number;
  comboMax?: number;
  durationSeconds?: number;
}

export interface RecordSessionResult {
  awardedPoints: number;
  awardedXp: number;
  leveledUp: boolean;
  newLevel: number;
}

/**
 * Wraps record_activity_session() — see docs/BACKEND_ARCHITECTURE.md §7
 * for why this trusts nothing but a generous catalog-derived ceiling for
 * the client-reported score/xp. The RPC itself is `auth.uid()`-scoped
 * (see the migration), so there's no `userId` parameter here — a caller
 * can only ever record a session for themselves.
 */
export async function recordSession(client: Client, input: RecordSessionInput): Promise<ServiceResult<RecordSessionResult>> {
  const { data, error } = await recordActivitySessionRow(client, {
    p_activity_id: input.activityId,
    p_kind: input.kind,
    p_client_reported_points: input.clientReportedPoints,
    p_client_reported_xp: input.clientReportedXp,
    p_combo_max: input.comboMax ?? 0,
    p_duration_seconds: input.durationSeconds ?? 0,
  });
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");

  return ok({
    awardedPoints: data.awarded_points,
    awardedXp: data.awarded_xp,
    leveledUp: data.leveled_up,
    newLevel: data.new_level,
  });
}
