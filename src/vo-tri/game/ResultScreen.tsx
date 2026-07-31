import { Flame, RotateCcw } from "lucide-react";
import { resultCopy } from "@/vo-tri/copy/microcopy";
import { AchievementUnlockCard } from "@/vo-tri/ui/AchievementUnlockCard";
import { Button } from "@/vo-tri/ui/Button";
import { LevelUpBanner } from "@/vo-tri/ui/LevelUpBanner";
import { Mascot, type MascotMood } from "@/vo-tri/ui/Mascot";
import { RewardReveal } from "@/vo-tri/ui/RewardReveal";
import type { GameOutcome, ResultKind } from "./types";

const KIND_MOOD: Record<ResultKind, MascotMood> = {
  win: "celebrating",
  complete: "celebrating",
  lose: "thinking",
  timeout: "mindblown",
  abandoned: "sleepy",
};

/**
 * The Result Pipeline: every Activity's session — win, lose, a neutral
 * complete (e.g. check-in), a timeout, or an abandoned run — ends on
 * this one screen, differentiated only by `outcome.kind` (mood/heading/
 * copy from `resultCopy`, CTA emphasis flipped for the two "try again"
 * kinds), while always composing the same celebration vocabulary
 * (RewardReveal, optional LevelUpBanner/AchievementUnlockCard) so a
 * Activity author never re-invents this screen, only feeds it a real
 * `GameOutcome`.
 */
export function ResultScreen({
  outcome,
  activityName,
  onPlayAgain,
  onExit,
}: {
  outcome: GameOutcome;
  activityName: string;
  onPlayAgain?: () => void;
  onExit: () => void;
}) {
  const copy = resultCopy[outcome.kind];
  const isRetryFocused = outcome.kind === "lose" || outcome.kind === "timeout";

  return (
    <div className="vt-fade-up mx-auto flex max-w-md flex-col items-center gap-6 py-10 text-center">
      <Mascot mood={KIND_MOOD[outcome.kind]} size="xl" />
      <div>
        <h1 className="font-vt-display text-2xl font-extrabold text-vt-text-primary">{copy.title}</h1>
        <p className="mt-1 text-sm text-vt-text-secondary">
          {outcome.kind === "complete" ? `${copy.description} ${activityName}.` : copy.description}
        </p>
      </div>

      <RewardReveal points={outcome.points} xp={outcome.xp} coins={outcome.coins} />

      {(!!outcome.comboMax || (outcome.stats && outcome.stats.attempts > 1)) && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-vt-text-secondary">
          {!!outcome.comboMax && (
            <span className="flex items-center gap-1 rounded-vt-full border border-vt-border bg-vt-surface px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-vt-warning" /> Combo cao nhất x{outcome.comboMax}
            </span>
          )}
          {outcome.stats && outcome.stats.attempts > 1 && (
            <span className="rounded-vt-full border border-vt-border bg-vt-surface px-3 py-1">
              Lần thử thứ {outcome.stats.attempts} · Điểm cao nhất {outcome.stats.bestScore}
            </span>
          )}
        </div>
      )}

      {outcome.questCompleted && (
        <p className="vt-scale-in rounded-vt-full border border-vt-border bg-vt-surface px-4 py-2 text-sm text-vt-text-secondary">
          Nhiệm vụ hoàn thành: <span className="font-medium text-vt-text-primary">{outcome.questCompleted.name}</span>
        </p>
      )}

      {outcome.leveledUp && <LevelUpBanner newLevel={outcome.leveledUp.newLevel} />}

      {outcome.achievementUnlocked && <AchievementUnlockCard achievement={outcome.achievementUnlocked} />}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {onPlayAgain && (
          <Button variant={isRetryFocused ? "primary" : "outline"} size="lg" className="flex-1" onClick={onPlayAgain}>
            <RotateCcw className="h-4 w-4" /> Chơi lại
          </Button>
        )}
        <Button variant={isRetryFocused ? "outline" : "primary"} size="lg" className="flex-1" onClick={onExit}>
          Về Khám phá
        </Button>
      </div>
    </div>
  );
}
