import type { LucideIcon } from "lucide-react";

export type ActivityCategory = "may-man" | "thu-thach" | "giai-tri" | "nhanh";

export type ActivityDifficulty = "de" | "vua" | "kho";

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  icon: LucideIcon;
  reward: number;
  xp: number;
  difficulty: ActivityDifficulty;
  estMinutes: number;
  dailyLimit?: number;
  cooldownMinutes?: number;
  /** Set only for the one activity actually wired to a real action today (check-in). Every other activity is browse/detail-only until its own gameplay prompt. */
  action?: "check-in";
}

export interface ComingSoonActivity {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const DIFFICULTY_LABEL: Record<ActivityDifficulty, string> = {
  de: "Dễ",
  vua: "Vừa",
  kho: "Khó",
};

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  "may-man": "May mắn",
  "thu-thach": "Thử thách",
  "giai-tri": "Giải trí",
  nhanh: "Nhanh",
};
