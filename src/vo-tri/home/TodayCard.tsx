import { Flame, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/vo-tri/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/vo-tri/ui/Card";

export interface TodayStats {
  pointsToday: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  questTitle?: string;
}

/** Only rendered by the Home page when a real user session exists — no fabricated numbers when logged out. */
export function TodayCard({ stats }: { stats: TodayStats }) {
  const xpProgress = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Hôm nay của bạn</CardTitle>
        <Badge variant="reward">+{stats.pointsToday} điểm</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="xp">Level {stats.level}</Badge>
          <div className="h-2 flex-1 overflow-hidden rounded-vt-full bg-vt-surface">
            <div
              className="h-full rounded-vt-full bg-vt-gradient-brand transition-[width] duration-500 ease-out"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <span className="text-xs text-vt-text-secondary">
            {stats.xp}/{stats.xpToNextLevel} XP
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-vt-text-secondary">
          <Flame className="h-4 w-4 text-vt-warning" />
          Streak {stats.streakDays} ngày liên tiếp
        </div>

        {stats.questTitle && (
          <div className="flex items-center gap-2 rounded-vt-md border border-vt-border bg-vt-surface p-3 text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-vt-primary" />
            <span className="text-vt-text-primary">{stats.questTitle}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-vt-text-secondary">
          <Trophy className="h-3.5 w-3.5" />
          Tiếp tục để leo hạng hôm nay.
        </div>
      </CardContent>
    </Card>
  );
}
