import { Clock3, Sparkles, Trophy, Zap } from "lucide-react";
import { Badge } from "@/vo-tri/ui/Badge";
import { Button } from "@/vo-tri/ui/Button";
import { DIFFICULTY_LABEL, type Activity } from "./types";

export function FeaturedActivity({ activity, onSelect }: { activity: Activity; onSelect: (activity: Activity) => void }) {
  const Icon = activity.icon;

  return (
    <div className="vt-fade-up relative overflow-hidden rounded-vt-xl border border-vt-border bg-vt-card p-6 shadow-vt-2 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-vt-gradient-brand opacity-20 blur-[80px]" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            <Sparkles className="h-3 w-3" /> Nổi bật hôm nay
          </Badge>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-vt-lg bg-vt-primary/15 text-vt-primary">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-vt-display text-xl font-bold text-vt-text-primary sm:text-2xl">{activity.name}</h2>
              <p className="mt-1 max-w-md text-sm text-vt-text-secondary">{activity.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-vt-text-secondary">
            <span className="flex items-center gap-1 rounded-vt-full bg-vt-surface px-2.5 py-1">
              <Trophy className="h-3.5 w-3.5 text-vt-reward" /> +{activity.reward} điểm
            </span>
            <span className="flex items-center gap-1 rounded-vt-full bg-vt-surface px-2.5 py-1">
              <Zap className="h-3.5 w-3.5 text-vt-xp" /> +{activity.xp} XP
            </span>
            <span className="flex items-center gap-1 rounded-vt-full bg-vt-surface px-2.5 py-1">
              <Clock3 className="h-3.5 w-3.5" /> ~{activity.estMinutes} phút
            </span>
            <span className="rounded-vt-full bg-vt-surface px-2.5 py-1">{DIFFICULTY_LABEL[activity.difficulty]}</span>
          </div>
        </div>
        <Button variant="primary" size="lg" className="shrink-0" onClick={() => onSelect(activity)}>
          Thử ngay
        </Button>
      </div>
    </div>
  );
}
