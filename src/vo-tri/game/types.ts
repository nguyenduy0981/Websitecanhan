import type { LucideIcon } from "lucide-react";
import type { BadgeRarity } from "@/vo-tri/profile/types";

export type GameStage = "pre-game" | "playing" | "paused" | "result";

export interface GameplayContext {
  stage: GameStage;
  elapsedSeconds: number;
  score: number;
  progress: number;
  setScore: (score: number) => void;
  setProgress: (percent: number) => void;
  complete: (outcome: GameOutcome) => void;
}

export interface GameOutcome {
  points: number;
  xp: number;
  coins?: number;
  leveledUp?: { newLevel: number };
  achievementUnlocked?: {
    name: string;
    description: string;
    icon: LucideIcon;
    rarity: BadgeRarity;
  };
  questCompleted?: { name: string };
}
