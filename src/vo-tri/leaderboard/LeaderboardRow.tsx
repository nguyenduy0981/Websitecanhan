import { memo } from "react";
import { Avatar } from "@/vo-tri/ui/Avatar";
import { Badge } from "@/vo-tri/ui/Badge";
import { getRankChange, type LeaderboardPlayer } from "./types";
import { RankChangeIcon } from "./RankChangeIcon";

export const ROW_HEIGHT_PX = 64;

/**
 * Fixed height (ROW_HEIGHT_PX) and memoized on purpose: a leaderboard is
 * exactly the kind of list that needs to scale to thousands of players.
 * Today it's a plain `.map()` (see LeaderboardList) since there's no real
 * data yet to virtualize, but a fixed, measurable row height means
 * dropping in react-window/virtua later is a LeaderboardList-only change
 * — this component doesn't need to change at all.
 */
export const LeaderboardRow = memo(function LeaderboardRow({ player }: { player: LeaderboardPlayer }) {
  const change = getRankChange(player);

  return (
    <div
      className="vt-interactive flex items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card px-4"
      style={{ height: ROW_HEIGHT_PX }}
    >
      <div className="flex w-10 shrink-0 flex-col items-center">
        <span className="font-vt-display text-sm font-bold text-vt-text-primary">#{player.rank}</span>
        <RankChangeIcon change={change} />
      </div>

      <Avatar name={player.name} avatarUrl={player.avatarUrl} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-vt-text-primary">{player.name}</p>
        <p className="text-xs text-vt-text-secondary">Level {player.level}</p>
      </div>

      {player.badgeLabel && (
        <Badge variant="vip" className="hidden sm:inline-flex">
          {player.badgeLabel}
        </Badge>
      )}

      <p className="shrink-0 text-right font-vt-display text-sm font-bold text-vt-secondary">
        {player.points.toLocaleString("vi-VN")}
      </p>
    </div>
  );
});
