"use client";

import { Coins, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { playSound } from "@/vo-tri/lib/sound";

const COUNT_UP_MS = 800;

/** rAF-driven count-up (not CSS, since the displayed text itself must change) — skips straight to the final value under prefers-reduced-motion instead of animating. */
function useCountUp(target: number, active: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);

  return value;
}

function RewardPill({
  icon: Icon,
  tone,
  value,
  suffix,
  delay,
}: {
  icon: typeof Trophy;
  tone: string;
  value: number;
  suffix: string;
  delay: string;
}) {
  const count = useCountUp(value, true);
  return (
    <div
      className="vt-bounce-in flex flex-col items-center gap-1 rounded-vt-lg border border-vt-border bg-vt-card px-5 py-4"
      style={{ animationDelay: delay }}
    >
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="font-vt-display text-2xl font-extrabold text-vt-text-primary">
        +{count}
        {suffix}
      </p>
    </div>
  );
}

/**
 * Generic "you just earned X" reveal — used by the Gameplay Framework's
 * ResultScreen AND the Retention System's quest/goal claim moment. Lives
 * in ui/ (not game/) because it's a domain-agnostic celebration
 * primitive, not something specific to gameplay.
 */
export function RewardReveal({ points, xp, coins }: { points: number; xp: number; coins?: number }) {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playSound("reward");
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <RewardPill icon={Trophy} tone="text-vt-reward" value={points} suffix=" điểm" delay="0ms" />
      <RewardPill icon={Zap} tone="text-vt-xp" value={xp} suffix=" XP" delay="80ms" />
      {coins !== undefined && <RewardPill icon={Coins} tone="text-vt-warning" value={coins} suffix=" coin" delay="160ms" />}
    </div>
  );
}
