import { Mascot } from "@/vo-tri/ui/Mascot";
import { LeaderboardRow } from "./LeaderboardRow";
import type { LeaderboardPlayer } from "./types";

export function LeaderboardList({ players }: { players: LeaderboardPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card py-14 text-center">
        <Mascot mood="sleepy" size="lg" />
        <div>
          <p className="font-vt-display text-base font-semibold text-vt-text-primary">Bảng xếp hạng đang chờ người đầu tiên</p>
          <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">
            Chưa ai đủ vô tri để đứng đầu bảng này. Có thể là bạn?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {players.map((player) => (
        <LeaderboardRow key={player.id} player={player} />
      ))}
    </div>
  );
}
