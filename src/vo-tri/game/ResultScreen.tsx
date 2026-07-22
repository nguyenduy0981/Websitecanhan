import { RotateCcw } from "lucide-react";
import { AchievementUnlockCard } from "@/vo-tri/ui/AchievementUnlockCard";
import { Button } from "@/vo-tri/ui/Button";
import { LevelUpBanner } from "@/vo-tri/ui/LevelUpBanner";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { RewardReveal } from "@/vo-tri/ui/RewardReveal";
import type { GameOutcome } from "./types";

/**
 * The one result composition every future Activity ends on — same
 * building blocks (reward reveal, optional level-up, optional
 * achievement, optional quest line, CTA row) regardless of what the
 * gameplay actually was. Nothing here is fabricated: every value comes
 * from the real `outcome` the gameplay body passed to `complete()`.
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
  return (
    <div className="vt-fade-up mx-auto flex max-w-md flex-col items-center gap-6 py-10 text-center">
      <Mascot mood="celebrating" size="xl" />
      <div>
        <h1 className="font-vt-display text-2xl font-extrabold text-vt-text-primary">Xong xuôi!</h1>
        <p className="mt-1 text-sm text-vt-text-secondary">Bạn vừa hoàn thành {activityName}.</p>
      </div>

      <RewardReveal points={outcome.points} xp={outcome.xp} coins={outcome.coins} />

      {outcome.questCompleted && (
        <p className="vt-scale-in rounded-vt-full border border-vt-border bg-vt-surface px-4 py-2 text-sm text-vt-text-secondary">
          Nhiệm vụ hoàn thành: <span className="font-medium text-vt-text-primary">{outcome.questCompleted.name}</span>
        </p>
      )}

      {outcome.leveledUp && <LevelUpBanner newLevel={outcome.leveledUp.newLevel} />}

      {outcome.achievementUnlocked && <AchievementUnlockCard achievement={outcome.achievementUnlocked} />}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {onPlayAgain && (
          <Button variant="outline" size="lg" className="flex-1" onClick={onPlayAgain}>
            <RotateCcw className="h-4 w-4" /> Chơi lại
          </Button>
        )}
        <Button variant="primary" size="lg" className="flex-1" onClick={onExit}>
          Về Khám phá
        </Button>
      </div>
    </div>
  );
}
