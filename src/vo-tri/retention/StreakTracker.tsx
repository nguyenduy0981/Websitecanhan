import { Flame } from "lucide-react";
import { Card, CardContent } from "@/vo-tri/ui/Card";
import { cn } from "@/vo-tri/lib/cn";
import type { StreakData } from "./types";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/**
 * `compact` drops the card chrome + longest-streak stat for embedding
 * inside another card (Home's TodayCard) — same data, same dot strip,
 * just less visual weight when it's not the main event.
 */
export function StreakTracker({ streak, compact = false }: { streak: StreakData; compact?: boolean }) {
  const today = new Date();
  // getDay(): 0=Sun..6=Sat → rotate so the strip always reads Mon..Sun.
  const todayIndex = (today.getDay() + 6) % 7;

  const body = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Flame className={cn("h-5 w-5", streak.currentStreak > 0 ? "text-vt-warning" : "text-vt-text-secondary")} />
        <p className="text-sm text-vt-text-primary">
          Streak <span className="font-vt-display font-bold">{streak.currentStreak} ngày</span>
        </p>
      </div>

      <div className="flex justify-between gap-1">
        {streak.last7Days.map((active, i) => {
          const isToday = i === streak.last7Days.length - 1;
          const dayLabel = DAY_LABELS[(todayIndex - (streak.last7Days.length - 1 - i) + 7) % 7];
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-vt-full text-[11px] font-semibold",
                  active ? "bg-vt-gradient-brand text-vt-on-accent shadow-vt-glow-primary" : "bg-vt-surface text-vt-text-secondary",
                  isToday && "ring-2 ring-vt-secondary ring-offset-2 ring-offset-vt-card",
                )}
              >
                {active ? <Flame className="h-3.5 w-3.5" aria-hidden /> : ""}
                <span className="sr-only">
                  {dayLabel}
                  {isToday && " (hôm nay)"}: {active ? "đã hoạt động" : "chưa hoạt động"}
                </span>
              </span>
              <span aria-hidden className="text-[10px] text-vt-text-secondary">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (compact) return body;

  return (
    <Card variant="elevated">
      <CardContent className="flex flex-col gap-4">
        {body}
        <p className="text-xs text-vt-text-secondary">
          Streak dài nhất: <span className="font-semibold text-vt-text-primary">{streak.longestStreak} ngày</span>
        </p>
      </CardContent>
    </Card>
  );
}
