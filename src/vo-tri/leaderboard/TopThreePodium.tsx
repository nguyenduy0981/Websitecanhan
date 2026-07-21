import { Crown } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import type { LeaderboardPlayer } from "./types";

const PODIUM_ORDER: { rank: 1 | 2 | 3; order: string; height: string; ring: string; delay: string }[] = [
  { rank: 2, order: "order-1", height: "h-40 sm:h-48", ring: "border-vt-border", delay: "80ms" },
  { rank: 1, order: "order-2", height: "h-48 sm:h-60", ring: "border-vt-reward shadow-vt-glow-primary", delay: "0ms" },
  { rank: 3, order: "order-3", height: "h-36 sm:h-40", ring: "border-vt-border", delay: "160ms" },
];

function PlayerAvatar({ player, size }: { player: LeaderboardPlayer; size: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-vt-full border-2 bg-vt-card text-vt-text-primary"
      style={{ width: size, height: size }}
    >
      {player.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-vt-display font-bold" style={{ fontSize: size * 0.4 }}>
          {player.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/** Three visually distinct podium slots (not three identical cards) with a staggered pop-in — 1st reads as clearly "the" top spot, not just "first in a list". */
export function TopThreePodium({ players }: { players: LeaderboardPlayer[] }) {
  const byRank = new Map(players.map((p) => [p.rank, p]));

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4">
      {PODIUM_ORDER.map(({ rank, order, height, ring, delay }) => {
        const player = byRank.get(rank);
        if (!player) return null;
        return (
          <div
            key={rank}
            className={cn("vt-bounce-in flex flex-1 flex-col items-center gap-2", order)}
            style={{ animationDelay: delay }}
          >
            {rank === 1 && <Crown className="h-6 w-6 text-vt-reward" />}
            <PlayerAvatar player={player} size={rank === 1 ? 72 : 56} />
            <p className="max-w-[6.5rem] truncate text-sm font-semibold text-vt-text-primary">{player.name}</p>
            <p className="text-xs text-vt-text-secondary">{player.points.toLocaleString("vi-VN")} điểm</p>
            <div
              className={cn(
                "flex w-full items-center justify-center rounded-t-vt-lg border-x border-t bg-vt-card font-vt-display text-2xl font-extrabold text-vt-text-primary",
                height,
                ring,
              )}
            >
              #{rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}
