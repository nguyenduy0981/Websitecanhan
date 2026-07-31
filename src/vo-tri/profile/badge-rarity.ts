import type { BadgeRarity } from "./types";

/** Shared between BadgeCollection and the gameplay framework's AchievementUnlockCard — one rarity → visual-treatment mapping instead of two. */
export const RARITY_RING: Record<BadgeRarity, string> = {
  common: "border-vt-border",
  rare: "border-vt-secondary shadow-vt-glow-secondary",
  special: "border-vt-vip shadow-vt-glow-vip",
};
