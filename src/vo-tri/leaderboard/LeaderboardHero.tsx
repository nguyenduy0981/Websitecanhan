import { Trophy } from "lucide-react";
import { Badge } from "@/vo-tri/ui/Badge";
import type { MyPosition } from "./types";

/** Season name is real designed content (like Explore's activity catalog) — a game-design label, not fabricated user data. */
export function LeaderboardHero({ seasonName = "Mùa 1: Khởi Đầu Vô Tri", myPosition }: { seasonName?: string; myPosition?: MyPosition }) {
  return (
    <div className="vt-fade-up relative overflow-hidden rounded-vt-xl border border-vt-border bg-vt-card p-6 text-center sm:p-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vt-gradient-brand opacity-[0.16] blur-[100px]" />

      <div className="relative flex flex-col items-center gap-3">
        <Badge variant="reward" className="w-fit">
          <Trophy className="h-3 w-3" /> {seasonName}
        </Badge>
        <h1 className="font-vt-display text-2xl font-extrabold text-vt-text-primary sm:text-3xl">Ai Vô Tri Nhất Tuần Này?</h1>
        <p className="max-w-md text-sm text-vt-text-secondary">
          Không ai ép bạn phải đứng đầu. Nhưng nếu leo lên được thì... cũng ngầu đấy.
        </p>

        {myPosition ? (
          <div className="mt-2 flex items-center gap-4 rounded-vt-full border border-vt-border bg-vt-surface px-5 py-2.5 text-sm">
            <span className="text-vt-text-secondary">
              Hạng của bạn: <span className="font-semibold text-vt-text-primary">#{myPosition.rank}</span>
            </span>
            <span className="text-vt-text-secondary">
              <span className="font-semibold text-vt-primary">{myPosition.points.toLocaleString("vi-VN")}</span> điểm
            </span>
          </div>
        ) : (
          <p className="mt-1 text-xs text-vt-text-secondary">Bạn chưa có hạng — chơi vài trò ở Khám Phá để bắt đầu leo bảng.</p>
        )}
      </div>
    </div>
  );
}
