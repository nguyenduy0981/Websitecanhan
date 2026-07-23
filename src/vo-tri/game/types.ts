import type { LucideIcon } from "lucide-react";
import type { BadgeRarity } from "@/vo-tri/profile/types";
import type { ScoringStrategy } from "./scoring";

export type GameStage = "pre-game" | "countdown" | "playing" | "paused" | "result";

/** How a session ended — every Activity's result renders through the same ResultScreen, differentiated only by which kind it got. */
export type ResultKind = "win" | "lose" | "complete" | "timeout" | "abandoned";

/**
 * What an Activity declares to get engine behavior for free instead of
 * re-implementing it: a time limit turns the timer into a countdown that
 * auto-ends the session; a target score auto-wins once reached; combo
 * tracking + a custom scoring formula are opt-in. Every field is
 * optional — the simplest Activity (e.g. today's check-in) declares
 * none of them and just calls `ctx.complete()` itself.
 */
export interface ActivityRules {
  /** Session becomes a countdown timer; hitting 0 auto-triggers a "timeout" result. */
  timeLimitSeconds?: number;
  /** Reaching this score while playing auto-triggers a "win" result. */
  targetScore?: number;
  /** Seconds of "3, 2, 1, Go" before play starts. 0/undefined skips it (today's only real Activity relies on this default so its tested flow doesn't change). */
  countdownSeconds?: number;
  /** Whether `registerHit`/`registerMiss` track a combo multiplier at all. */
  comboEnabled?: boolean;
  /** A miss resets the combo to 0. Default true when comboEnabled. */
  comboResetOnMiss?: boolean;
  /** Overrides the engine's default difficulty+combo scoring formula. */
  scoring?: ScoringStrategy;
}

export interface SessionStats {
  /** How many times this session has been (re)started, including the current attempt. */
  attempts: number;
  bestScore: number;
  durationSeconds: number;
}

export interface GameplayContext {
  stage: GameStage;
  elapsedSeconds: number;
  /** Only meaningful when `rules.timeLimitSeconds` is set — counts down to 0. */
  remainingSeconds?: number;
  score: number;
  progress: number;
  /** Current combo count — always 0 when `rules.comboEnabled` isn't set. */
  combo: number;
  /** Reports `basePoints` worth of scoring event; the engine applies difficulty + combo multipliers (or the Activity's own `rules.scoring`) and adds the result to `score`. */
  addScore: (basePoints: number) => void;
  /** Increments the combo counter (only meaningful when `rules.comboEnabled`). */
  registerHit: () => void;
  /** Resets the combo counter to 0 (only meaningful when `rules.comboEnabled`). */
  registerMiss: () => void;
  setProgress: (percent: number) => void;
  /** Ends the session with a "win" result. */
  win: (extra?: Partial<GameOutcome>) => void;
  /** Ends the session with a "lose" result. */
  lose: (extra?: Partial<GameOutcome>) => void;
  /** Ends the session with a neutral "complete" result (e.g. check-in — no win/lose concept). */
  complete: (extra?: Partial<GameOutcome>) => void;
}

export interface GameOutcome {
  kind: ResultKind;
  points: number;
  xp: number;
  coins?: number;
  comboMax?: number;
  stats?: SessionStats;
  leveledUp?: { newLevel: number };
  achievementUnlocked?: {
    name: string;
    description: string;
    icon: LucideIcon;
    rarity: BadgeRarity;
  };
  questCompleted?: { name: string };
}
