import { Card, CardContent } from "@/vo-tri/ui/Card";
import { ProgressBar } from "@/vo-tri/ui/ProgressBar";
import type { LevelProgress } from "./types";

export function LevelCard({ progress }: { progress: LevelProgress }) {
  const percent = Math.round((progress.xp / progress.xpToNext) * 100);
  const remaining = Math.max(0, progress.xpToNext - progress.xp);

  return (
    <Card variant="elevated">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-vt-text-secondary">Level hiện tại</p>
            <p className="font-vt-display text-4xl font-extrabold text-vt-text-primary">{progress.level}</p>
          </div>
          <p className="text-right text-sm text-vt-text-secondary">
            <span className="font-semibold text-vt-secondary">{progress.xp}</span> / {progress.xpToNext} XP
          </p>
        </div>

        <ProgressBar percent={percent} />

        <p className="text-xs text-vt-text-secondary">
          Còn <span className="font-semibold text-vt-text-primary">{remaining} XP</span> nữa để lên Level {progress.level + 1}.
        </p>
      </CardContent>
    </Card>
  );
}
