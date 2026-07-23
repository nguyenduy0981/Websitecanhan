"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Activity } from "@/vo-tri/explore/types";
import { trackEvent } from "@/vo-tri/lib/analytics";
import { playSound } from "@/vo-tri/lib/sound";
import { DEFAULT_SCORING } from "./scoring";
import { CountdownOverlay } from "./CountdownOverlay";
import { ExitConfirmDialog } from "./ExitConfirmDialog";
import { GameHeader } from "./GameHeader";
import { PausedOverlay } from "./PausedOverlay";
import { PreGameScreen } from "./PreGameScreen";
import { ResultScreen } from "./ResultScreen";
import type { ActivityRules, GameOutcome, GameplayContext, GameStage, ResultKind } from "./types";

/**
 * The Gameplay Engine every Activity plugs into: pre-game → (countdown) →
 * playing ⇄ paused → result. An Activity declares `rules` (time limit,
 * target score, combo, custom scoring) to get timer/scoring/win-lose
 * handled automatically; the actual on-screen gameplay is still supplied
 * via `children` (a render-prop receiving `GameplayContext`) since two
 * different minigames can look nothing alike — the Engine owns
 * everything *around* that, not what's inside it.
 *
 * `rules` is entirely optional and every field defaults to "off," so an
 * Activity that declares none of them (today's only real one) behaves
 * exactly as the framework did before this rewrite — verified via the
 * unchanged E2E flow in tests/e2e/play-flow.spec.ts.
 */
export function GameFrame({
  activity,
  rules = {},
  onExit,
  children,
}: {
  activity: Activity;
  rules?: ActivityRules;
  onExit: () => void;
  children: (ctx: GameplayContext) => ReactNode;
}) {
  const [stage, setStage] = useState<GameStage>("pre-game");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [combo, setCombo] = useState(0);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const attemptsRef = useRef(0);
  const bestScoreRef = useRef(0);
  const maxComboRef = useRef(0);

  const remainingSeconds = rules.timeLimitSeconds !== undefined ? Math.max(0, rules.timeLimitSeconds - elapsedSeconds) : undefined;

  useEffect(() => {
    if (stage !== "playing") return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  // Auto-timeout: a declared time limit hitting 0 ends the session for
  // the Activity, same as calling ctx.lose() would, without it having to
  // watch its own clock.
  useEffect(() => {
    if (stage === "playing" && remainingSeconds === 0) finish("timeout");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, remainingSeconds]);

  // Auto-win: a declared target score reached ends the session as a win.
  useEffect(() => {
    if (stage === "playing" && rules.targetScore !== undefined && score >= rules.targetScore) finish("win");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, score]);

  function finish(kind: ResultKind, extra?: Partial<GameOutcome>) {
    bestScoreRef.current = Math.max(bestScoreRef.current, score);
    const result: GameOutcome = {
      kind,
      points: score,
      xp: activity.xp,
      comboMax: maxComboRef.current,
      stats: { attempts: attemptsRef.current, bestScore: bestScoreRef.current, durationSeconds: elapsedSeconds },
      ...extra,
    };
    setOutcome(result);
    setStage("result");
    playSound("result");
    trackEvent("activity_result", { activityId: activity.id, kind, points: result.points, comboMax: result.comboMax });
  }

  function handleStart() {
    attemptsRef.current += 1;
    trackEvent("activity_start", { activityId: activity.id, attempt: attemptsRef.current });
    if (rules.countdownSeconds) {
      setStage("countdown");
    } else {
      setStage("playing");
      playSound("game-start");
    }
  }

  function handleCountdownFinish() {
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
    if (stage === "playing" || stage === "paused" || stage === "countdown") {
      setExitConfirmOpen(true);
    } else {
      onExit();
    }
  }

  function confirmExit() {
    playSound("game-exit");
    trackEvent("activity_exit", { activityId: activity.id, elapsedSeconds });
    setExitConfirmOpen(false);
    onExit();
  }

  function playAgain() {
    setElapsedSeconds(0);
    setScore(0);
    setProgress(0);
    setCombo(0);
    maxComboRef.current = 0;
    setOutcome(null);
    setStage("pre-game");
  }

  function addScore(basePoints: number) {
    const strategy = rules.scoring ?? DEFAULT_SCORING;
    const delta = strategy({ basePoints, comboCount: combo, difficulty: activity.difficulty });
    setScore((s) => s + delta);
  }

  function registerHit() {
    if (!rules.comboEnabled) return;
    setCombo((c) => {
      const next = c + 1;
      maxComboRef.current = Math.max(maxComboRef.current, next);
      return next;
    });
  }

  function registerMiss() {
    if (!rules.comboEnabled) return;
    if (rules.comboResetOnMiss ?? true) setCombo(0);
  }

  if (stage === "pre-game") {
    return <PreGameScreen activity={activity} onStart={handleStart} />;
  }

  if (stage === "result" && outcome) {
    return <ResultScreen outcome={outcome} activityName={activity.name} onPlayAgain={playAgain} onExit={onExit} />;
  }

  const ctx: GameplayContext = {
    stage,
    elapsedSeconds,
    remainingSeconds,
    score,
    progress,
    combo,
    addScore,
    registerHit,
    registerMiss,
    setProgress,
    win: (extra) => finish("win", extra),
    lose: (extra) => finish("lose", extra),
    complete: (extra) => finish("complete", extra),
  };

  return (
    <div className="flex flex-col gap-6">
      <GameHeader
        title={activity.name}
        paused={stage === "paused"}
        onPause={handlePause}
        onResume={handleResume}
        onExit={requestExit}
        elapsedSeconds={remainingSeconds === undefined ? elapsedSeconds : undefined}
        remainingSeconds={remainingSeconds}
        score={score}
        combo={rules.comboEnabled ? combo : undefined}
        progress={progress}
      />

      <div className="relative min-h-[50vh] overflow-hidden rounded-vt-xl border border-vt-border bg-vt-card p-4">
        {children(ctx)}
        {stage === "countdown" && <CountdownOverlay seconds={rules.countdownSeconds!} onFinish={handleCountdownFinish} />}
        {stage === "paused" && <PausedOverlay onResume={handleResume} onExit={requestExit} />}
      </div>

      <ExitConfirmDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen} onConfirmExit={confirmExit} />
    </div>
  );
}
