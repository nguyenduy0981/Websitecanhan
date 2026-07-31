"use client";

import { useEffect, useRef } from "react";
import { playSound } from "@/vo-tri/lib/sound";
import type { MilestoneDefinition } from "./types";

/** Sibling to ui/LevelUpBanner — same compact "vt-scale-in" banner language, milestone-flavored instead of level-flavored. Kept as its own small component rather than generalizing a shared base: two ~15-line banners with different icons/copy don't yet justify an abstraction layer. */
export function MilestoneBanner({ milestone }: { milestone: MilestoneDefinition }) {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playSound("milestone-reached");
  }, []);

  const Icon = milestone.icon;

  return (
    <div className="vt-scale-in flex items-center gap-3 rounded-vt-lg border border-vt-reward/40 bg-vt-reward/10 px-4 py-3">
      <Icon className="h-5 w-5 text-vt-reward" />
      <div className="text-left">
        <p className="text-xs uppercase tracking-wide text-vt-text-secondary">Cột mốc mới</p>
        <p className="text-sm text-vt-text-primary">
          <span className="font-vt-display font-bold">{milestone.title}</span> — {milestone.description}
        </p>
      </div>
    </div>
  );
}
