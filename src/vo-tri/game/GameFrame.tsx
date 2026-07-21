"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Activity } from "@/vo-tri/explore/types";
import { playSound } from "@/vo-tri/lib/sound";
import { ExitConfirmDialog } from "./ExitConfirmDialog";
import { GameHeader } from "./GameHeader";
import { PausedOverlay } from "./PausedOverlay";
import { PreGameScreen } from "./PreGameScreen";
import { ResultScreen } from "./ResultScreen";
import type { GameOutcome, GameplayContext, GameStage } from "./types";

/**
 * The reusable state machine every future Activity plugs into:
 * pre-game → playing ⇄ paused → result. The actual gameplay is supplied
 * by the caller via `children` (a render-prop receiving `GameplayContext`
 * — score/progress setters and `complete()`) so this component never
 * needs to know what any specific Activity's gameplay looks like. No
 * real gameplay is implemented here on purpose — see
 * src/app/play/[activityId]/page.tsx for the honest placeholder used
 * until real minigames exist.
 */
export function GameFrame({
  activity,
  onExit,
  children,
}: {
  activity: Activity;
  onExit: () => void;
  children: (ctx: GameplayContext) => ReactNode;
}) {
  const [stage, setStage] = useState<GameStage>("pre-game");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  useEffect(() => {
    if (stage !== "playing") return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  function handleStart() {
    setStage("playing");
    playSound("game-start");
  }

  function handlePause() {
    setStage("paused");
    playSound("game-pause");
  }

  function handleResume() {
    setStage("playing");
  }

  function requestExit() {
    if (stage === "playing" || stage === "paused") {
      setExitConfirmOpen(true);
    } else {
      onExit();
    }
  }

  function confirmExit() {
    playSound("game-exit");
    setExitConfirmOpen(false);
    onExit();
  }

  function complete(result: GameOutcome) {
    setOutcome(result);
    setStage("result");
    playSound("result");
  }

  function playAgain() {
    setElapsedSeconds(0);
    setScore(0);
    setProgress(0);
    setOutcome(null);
    setStage("pre-game");
  }

  if (stage === "pre-game") {
    return <PreGameScreen activity={activity} onStart={handleStart} />;
  }

  if (stage === "result" && outcome) {
    return <ResultScreen outcome={outcome} activityName={activity.name} onPlayAgain={playAgain} onExit={onExit} />;
  }

  const ctx: GameplayContext = { stage, elapsedSeconds, score, progress, setScore, setProgress, complete };

  return (
    <div className="flex flex-col gap-6">
      <GameHeader
        title={activity.name}
        paused={stage === "paused"}
        onPause={handlePause}
        onResume={handleResume}
        onExit={requestExit}
        elapsedSeconds={elapsedSeconds}
        score={score}
        progress={progress}
      />

      <div className="relative min-h-[50vh] overflow-hidden rounded-vt-xl border border-vt-border bg-vt-card p-4">
        {children(ctx)}
        {stage === "paused" && <PausedOverlay onResume={handleResume} onExit={requestExit} />}
      </div>

      <ExitConfirmDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen} onConfirmExit={confirmExit} />
    </div>
  );
}
