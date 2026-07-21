import { Card, CardContent } from "@/vo-tri/ui/Card";
import type { LevelProgress } from "./types";

/** Custom progress bar (gradient fill + glowing leading dot), not a default <progress>/browser bar — level-up is the single most "core game loop" moment on this page. */
export function LevelCard({ progress }: { progress: LevelProgress }) {
  const percent = Math.min(100, Math.round((progress.xp / progress.xpToNext) * 100));
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

        <div className="relative h-3 overflow-hidden rounded-vt-full bg-vt-surface">
          <div
            className="relative h-full rounded-vt-full bg-vt-gradient-brand transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          >
            <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-vt-full bg-vt-secondary shadow-vt-glow-secondary" />
          </div>
        </div>

        <p className="text-xs text-vt-text-secondary">
          Còn <span className="font-semibold text-vt-text-primary">{remaining} XP</span> nữa để lên Level {progress.level + 1}.
        </p>
      </CardContent>
    </Card>
  );
}
