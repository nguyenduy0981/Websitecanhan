"use client";

import { TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { playSound } from "@/vo-tri/lib/sound";

/** "Animation nhẹ, không phô trương" — a compact banner (vt-scale-in), not a full-screen takeover. */
export function LevelUpBanner({ newLevel }: { newLevel: number }) {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playSound("level-up");
  }, []);

  return (
    <div className="vt-scale-in flex items-center gap-3 rounded-vt-lg border border-vt-xp/40 bg-vt-xp/10 px-4 py-3">
      <TrendingUp className="h-5 w-5 text-vt-xp" />
      <p className="text-sm text-vt-text-primary">
        Lên <span className="font-vt-display font-bold">Level {newLevel}</span> rồi đó!
      </p>
    </div>
  );
}
