import { Clock3, Trophy, Zap } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import { DIFFICULTY_LABEL, type Activity } from "./types";

export function ActivityCard({ activity, onSelect }: { activity: Activity; onSelect: (activity: Activity) => void }) {
  const Icon = activity.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(activity)}
      className="vt-interactive group flex flex-col gap-3 rounded-vt-lg border border-vt-border bg-vt-card p-4 text-left shadow-vt-1 hover:shadow-vt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-vt-md bg-vt-primary/15 text-vt-primary transition-transform duration-vt-fast group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </span>
        <span className={cn("rounded-vt-full px-2 py-0.5 text-[11px] font-medium", DIFFICULTY_TONE[activity.difficulty])}>
          {DIFFICULTY_LABEL[activity.difficulty]}
        </span>
      </div>

      <div>
        <h3 className="font-vt-display text-sm font-semibold text-vt-text-primary">{activity.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-vt-text-secondary">{activity.description}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-vt-text-secondary">
        <span className="flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5 text-vt-reward" /> {activity.reward}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-vt-xp" /> {activity.xp}
        </span>
        <span className="flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" /> {activity.estMinutes}p
        </span>
      </div>

      {(activity.dailyLimit || activity.cooldownMinutes) && (
        <p className="text-[11px] text-vt-text-secondary">
          {activity.dailyLimit && `Tối đa ${activity.dailyLimit} lần/ngày`}
          {activity.dailyLimit && activity.cooldownMinutes && " · "}
          {activity.cooldownMinutes && `Hồi ${formatCooldown(activity.cooldownMinutes)}`}
        </p>
      )}
    </button>
  );
}

const DIFFICULTY_TONE: Record<Activity["difficulty"], string> = {
  de: "bg-vt-success/15 text-vt-success",
  vua: "bg-vt-warning/15 text-vt-warning",
  kho: "bg-vt-danger/15 text-vt-danger",
};

function formatCooldown(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  return `${Math.round(minutes / 60)} giờ`;
}
