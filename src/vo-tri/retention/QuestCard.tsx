"use client";

import { Check, Trophy, Zap } from "lucide-react";
import { Badge } from "@/vo-tri/ui/Badge";
import { Button } from "@/vo-tri/ui/Button";
import { Card, CardContent } from "@/vo-tri/ui/Card";
import { ProgressBar } from "@/vo-tri/ui/ProgressBar";
import { cn } from "@/vo-tri/lib/cn";
import type { QuestDefinition, QuestProgress } from "./types";

const CADENCE_LABEL = { daily: "Hôm nay", weekly: "Tuần này" } as const;

/**
 * One quest/goal, in every state it can be in:
 *  - `progress` undefined → not logged in: shows the real quest (catalog
 *    content, safe to show anyone) but honestly can't show personal
 *    progress, so that area says so instead of faking a number.
 *  - in progress → real progress bar, no claim yet.
 *  - target reached, not claimed → "Nhận thưởng" lights up.
 *  - claimed → dimmed, checkmark, no further action.
 */
export function QuestCard({
  quest,
  progress,
  onClaim,
}: {
  quest: QuestDefinition;
  progress?: QuestProgress;
  onClaim?: (quest: QuestDefinition) => void;
}) {
  const Icon = quest.icon;
  const current = progress?.current ?? 0;
  const isReady = !!progress && current >= quest.target && !progress.claimed;
  const isClaimed = !!progress?.claimed;
  const percent = Math.min(100, Math.round((current / quest.target) * 100));

  return (
    <Card variant="elevated" padding="sm" className={cn("flex flex-col gap-3", isClaimed && "opacity-60")}>
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vt-md bg-vt-primary/15 text-vt-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-vt-display text-sm font-semibold text-vt-text-primary">{quest.title}</p>
              <p className="text-xs text-vt-text-secondary">{quest.description}</p>
            </div>
          </div>
          <Badge variant="neutral" className="shrink-0">
            {CADENCE_LABEL[quest.cadence]}
          </Badge>
        </div>

        {progress ? (
          <div className="flex items-center gap-2">
            <ProgressBar percent={percent} className="flex-1" />
            <span className="shrink-0 text-xs text-vt-text-secondary">
              {Math.min(current, quest.target)}/{quest.target} {quest.unit}
            </span>
          </div>
        ) : (
          <p className="rounded-vt-md border border-dashed border-vt-border px-3 py-2 text-xs text-vt-text-secondary">
            Đăng nhập để theo dõi tiến độ nhiệm vụ này.
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-vt-text-secondary">
            <span className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-vt-reward" /> {quest.reward}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-vt-xp" /> {quest.xp}
            </span>
          </div>

          {isClaimed ? (
            <span className="flex items-center gap-1 text-xs font-medium text-vt-success">
              <Check className="h-3.5 w-3.5" /> Đã nhận
            </span>
          ) : (
            <Button size="sm" variant={isReady ? "primary" : "outline"} disabled={!isReady} onClick={() => onClaim?.(quest)}>
              Nhận thưởng
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
