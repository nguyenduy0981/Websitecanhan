"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { playSound } from "@/vo-tri/lib/sound";
import { RARITY_RING } from "@/vo-tri/profile/badge-rarity";
import type { BadgeRarity } from "@/vo-tri/profile/types";

export interface UnlockedAchievement {
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: BadgeRarity;
}

/** Same rarity → visual-treatment mapping as Profile's BadgeCollection (common/rare/special) — reused, not reinvented, so a badge looks the same whether you see it unlock here or browse it later on your profile. */
export function AchievementUnlockCard({ achievement }: { achievement: UnlockedAchievement }) {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playSound("achievement");
  }, []);

  const Icon = achievement.icon;

  return (
    <div
      className={`vt-bounce-in flex items-center gap-3 rounded-vt-lg border-2 bg-vt-card p-4 text-left ${RARITY_RING[achievement.rarity]}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-vt-full bg-vt-primary/15 text-vt-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-vt-text-secondary">Huy hiệu mới</p>
        <p className="font-vt-display text-sm font-bold text-vt-text-primary">{achievement.name}</p>
        <p className="text-xs text-vt-text-secondary">{achievement.description}</p>
      </div>
    </div>
  );
}
