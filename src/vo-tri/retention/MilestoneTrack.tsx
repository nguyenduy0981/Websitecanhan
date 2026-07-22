import { Check, Lock } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import type { MilestoneDefinition } from "./types";

/**
 * A single-metric progression ladder (e.g. every streak-length
 * milestone) rendered as a connected horizontal track — distinct from
 * AchievementSection's grid on purpose: achievements are independent
 * one-off unlocks, milestones are ordered steps on one running number.
 * `current` is the real value for whatever metric this track represents
 * (e.g. current streak, or total activities played) — undefined means
 * "not logged in," rendered as every marker locked rather than a fake 0.
 */
export function MilestoneTrack({
  title,
  milestones,
  current,
}: {
  title: string;
  milestones: MilestoneDefinition[];
  current?: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-vt-display text-sm font-semibold text-vt-text-primary">{title}</h3>
      <div className="relative overflow-x-auto pb-2">
        <div className="absolute left-7 right-7 top-7 h-0.5 bg-vt-border" aria-hidden />
        <div className="relative flex gap-4">
          {milestones.map((milestone, i) => {
            const reached = current !== undefined && current >= milestone.threshold;
            const isNext = current !== undefined && !reached && (i === 0 || current >= milestones[i - 1]!.threshold);
            const Icon = milestone.icon;

            return (
              <div key={milestone.id} className="flex shrink-0 flex-col items-center gap-2 text-center" style={{ width: 92 }}>
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-vt-full border-2 bg-vt-card",
                    reached
                      ? "border-vt-reward text-vt-reward shadow-vt-glow-primary"
                      : isNext
                        ? "border-vt-primary text-vt-primary"
                        : "border-vt-border text-vt-text-secondary",
                  )}
                >
                  {reached ? (
                    <Check className="h-5 w-5" />
                  ) : current === undefined ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold text-vt-text-primary">{milestone.title}</p>
                  <p className="text-[11px] text-vt-text-secondary">{milestone.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
