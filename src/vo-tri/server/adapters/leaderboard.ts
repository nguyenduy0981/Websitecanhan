import { getRank } from "@/vo-tri/profile/ranks";
import type { LeaderboardPlayer, MyPosition } from "@/vo-tri/leaderboard/types";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * `rank` isn't a stored column — the repository computes it via
 * `row_number() over (order by points desc)` in the query itself, so it
 * arrives here as a plain number alongside the profile row.
 * `previousRank` comes from the most recent `leaderboard_rank_snapshots`
 * row for this user+scope (absent until the snapshot job exists — see
 * docs/BACKEND_ARCHITECTURE.md §10 — `RankChangeIcon` already treats a
 * missing `previousRank` as "new").
 */
export function toLeaderboardPlayer(row: ProfileRow, rank: number, previousRank?: number): LeaderboardPlayer {
  return {
    id: row.id,
    rank,
    previousRank,
    name: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    level: row.level,
    points: row.points,
    badgeLabel: getRank(row.level),
  };
}

export function toMyPosition(rank: number, points: number, nextHigherPoints: number | undefined): MyPosition {
  return {
    rank,
    points,
    gapToNext: nextHigherPoints !== undefined ? Math.max(0, nextHigherPoints - points) : 0,
  };
}
