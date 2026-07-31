import type { MilestoneDefinition, MilestoneMetric, MilestoneProgress } from "@/vo-tri/retention/types";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type MilestoneProgressRow = Database["public"]["Tables"]["milestone_progress"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/** The metric's current value lives on `profiles` (current_streak / total_activities_played), never stored per-milestone — see docs/BACKEND_ARCHITECTURE.md §4.4. */
export function currentValueForMetric(row: ProfileRow, metric: MilestoneMetric): number {
  return metric === "streak" ? row.current_streak : row.total_activities_played;
}

/**
 * Combines the profile's live counter (for `current`) with the
 * milestone_progress row (for `reachedAt`, if the server has recorded it)
 * into the frontend's `MilestoneProgress` shape. `progressRow` is
 * `undefined` when the user has never interacted with this milestone yet
 * (no row exists until claim_milestone() runs at least once) — `current`
 * still reflects the real live counter either way.
 */
export function toMilestoneProgress(
  profileRow: ProfileRow,
  definition: MilestoneDefinition,
  progressRow: MilestoneProgressRow | undefined,
): MilestoneProgress {
  return {
    milestoneId: definition.id,
    current: currentValueForMetric(profileRow, definition.metric),
    reachedAt: progressRow?.reached_at ? new Date(progressRow.reached_at) : undefined,
  };
}
