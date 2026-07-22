import { Flag, Flame, Gift, LogIn, Target, Trophy, TrendingUp } from "lucide-react";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { cn } from "@/vo-tri/lib/cn";
import type { JourneyEvent, JourneyEventType } from "./types";

const EVENT_ICON: Record<JourneyEventType, typeof LogIn> = {
  joined: LogIn,
  "level-up": TrendingUp,
  achievement: Trophy,
  reward: Gift,
  quest: Target,
  milestone: Flag,
  streak: Flame,
};

const EVENT_TONE: Record<JourneyEventType, string> = {
  joined: "bg-vt-info/15 text-vt-info",
  "level-up": "bg-vt-xp/15 text-vt-xp",
  achievement: "bg-vt-reward/15 text-vt-reward",
  reward: "bg-vt-primary/15 text-vt-primary",
  quest: "bg-vt-secondary/15 text-vt-secondary",
  milestone: "bg-vt-reward/15 text-vt-reward",
  streak: "bg-vt-warning/15 text-vt-warning",
};

export function JourneyTimeline({ events }: { events: JourneyEvent[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Hành trình VÔ TRI</h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card py-10 text-center">
          <Mascot mood="thinking" size="md" />
          <div>
            <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Hành trình còn đang trống</p>
            <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">Mọi chuyện sắp bắt đầu — cứ chơi thử vài trò rồi quay lại xem.</p>
          </div>
        </div>
      ) : (
        <ol className="flex flex-col gap-0">
          {events.map((event, i) => {
            const Icon = EVENT_ICON[event.type];
            const isLast = i === events.length - 1;
            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-full", EVENT_TONE[event.type])}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {!isLast && <span className="my-1 w-px flex-1 bg-vt-divider" />}
                </div>
                <div className={cn("pb-6", isLast && "pb-0")}>
                  <p className="text-sm font-medium text-vt-text-primary">{event.label}</p>
                  <p className="text-xs text-vt-text-secondary">
                    {event.date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
