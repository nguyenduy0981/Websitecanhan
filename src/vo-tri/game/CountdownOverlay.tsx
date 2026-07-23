"use client";

import { useEffect, useState } from "react";

/**
 * Opt-in pre-play "3, 2, 1, Đi thôi!" — only shown when an Activity sets
 * `rules.countdownSeconds`. Skippable by click/keyboard (some players
 * just want to start), and skips itself entirely under
 * `prefers-reduced-motion` instead of animating through it.
 */
export function CountdownOverlay({ seconds, onFinish }: { seconds: number; onFinish: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onFinish();
      return;
    }
    if (step > seconds) {
      onFinish();
      return;
    }
    const id = setTimeout(() => setStep((s) => s + 1), 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const display = step < seconds ? seconds - step : "Đi thôi!";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFinish}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onFinish();
      }}
      aria-live="assertive"
      className="vt-pop-in absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-vt-xl bg-vt-bg/85 text-center backdrop-blur-vt-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
    >
      <p key={step} className="vt-bounce-in font-vt-display text-6xl font-extrabold text-vt-primary">
        {display}
      </p>
      <p className="text-xs text-vt-text-secondary">Nhấn để bỏ qua</p>
    </div>
  );
}
