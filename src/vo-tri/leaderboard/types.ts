export type RankChange = "up" | "down" | "same" | "new";

export interface LeaderboardPlayer {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  avatarUrl?: string;
  level: number;
  points: number;
  badgeLabel?: string;
}

export interface MyPosition {
  rank: number;
  points: number;
  gapToNext: number;
}

export type LeaderboardScope = "global" | "friends" | "week" | "month" | "season";

export const SCOPE_LABEL: Record<LeaderboardScope, string> = {
  global: "Toàn cầu",
  friends: "Bạn bè",
  week: "Tuần",
  month: "Tháng",
  season: "Mùa giải",
};

export function getRankChange(player: LeaderboardPlayer): RankChange {
  if (player.previousRank === undefined) return "new";
  if (player.previousRank > player.rank) return "up";
  if (player.previousRank < player.rank) return "down";
  return "same";
}
