import type { ActivityDifficulty } from "@/vo-tri/explore/types";

export interface ScoringInput {
  /** The raw point value the gameplay body reports for one hit/event. */
  basePoints: number;
  /** Engine-tracked combo count at the moment of this hit. */
  comboCount: number;
  difficulty?: ActivityDifficulty;
}

/** An Activity can supply its own formula; if it doesn't, DEFAULT_SCORING applies. */
export type ScoringStrategy = (input: ScoringInput) => number;

const DIFFICULTY_MULTIPLIER: Record<ActivityDifficulty, number> = {
  de: 1,
  vua: 1.25,
  kho: 1.5,
};

/** Combo bonus caps at +100% (10 stacks × 10%) so score can't run away unbounded on a long combo. */
const MAX_COMBO_BONUS_STACKS = 10;
const COMBO_BONUS_PER_STACK = 0.1;

/**
 * The engine's default reward-per-hit formula: base points × difficulty
 * multiplier × combo multiplier. Ties the Activity catalog's existing
 * (until now purely cosmetic) `difficulty` label and the engine's combo
 * counter into an actual number, so neither has to be re-invented per
 * Activity — a custom `ScoringStrategy` can still override this entirely
 * for a game that needs different math.
 */
export const DEFAULT_SCORING: ScoringStrategy = ({ basePoints, comboCount, difficulty }) => {
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty ?? "de"];
  const comboMultiplier = 1 + Math.min(comboCount, MAX_COMBO_BONUS_STACKS) * COMBO_BONUS_PER_STACK;
  return Math.round(basePoints * difficultyMultiplier * comboMultiplier);
};
