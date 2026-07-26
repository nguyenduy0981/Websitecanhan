import type { LucideIcon } from "lucide-react";

export type QuestCadence = "daily" | "weekly";

/** A quest/goal *definition* — real authored game-design content (like Explore's activity catalog), not per-user data. */
export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  cadence: QuestCadence;
  target: number;
  unit: string;
  reward: number;
  xp: number;
  icon: LucideIcon;
}

/** A user's real progress on one quest — doesn't exist until a backend does; always optional/absent today. */
export interface QuestProgress {
  questId: string;
  current: number;
  claimed: boolean;
}

/** Milestones track long-running progress on a single metric (streak length, activities played) — a ladder, not a one-off unlock like Achievement. Deliberately doesn't include a "level" metric since Profile's rank ladder (ranks.ts) already covers that thresholding. */
export type MilestoneMetric = "streak" | "activitiesPlayed";

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  metric: MilestoneMetric;
  threshold: number;
  icon: LucideIcon;
}

export interface MilestoneProgress {
  milestoneId: string;
  current: number;
  reachedAt?: Date;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  /** Last 7 days, oldest first — index 6 is today. */
  last7Days: boolean[];
}

/** The result of claiming a quest/goal reward — same shape family as GameOutcome, since a claim is conceptually the same "you just earned this" moment as finishing an Activity. */
export interface ClaimResult {
  points: number;
  xp: number;
  leveledUp?: { newLevel: number };
  /**
   * Just the id — a Server Action's return value crosses the same RSC
   * Flight-protocol boundary as a Server Component prop, so a full
   * `MilestoneDefinition` (its `icon` is a component reference) can't
   * travel here safely. Callers look up the full definition from
   * `milestones.ts` client-side by id, same fix class as
   * `DailyQuestPreview`/`PlayClient`'s existing icon workaround.
   */
  milestoneReached?: { id: string };
}
