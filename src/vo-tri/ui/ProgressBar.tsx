import { cn } from "@/vo-tri/lib/cn";

/**
 * Custom gradient progress bar (glowing leading dot, not a default
 * `<progress>`/browser bar) — extracted from Profile's LevelCard so the
 * gameplay framework's in-game HUD uses the exact same visual instead of
 * a second implementation.
 */
export function ProgressBar({ percent, className }: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={cn("relative h-3 overflow-hidden rounded-vt-full bg-vt-surface", className)}>
      <div
        className="relative h-full rounded-vt-full bg-vt-gradient-brand transition-[width] duration-vt-slow ease-vt-out"
        style={{ width: `${clamped}%` }}
      >
        <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-vt-full bg-vt-secondary shadow-vt-glow-secondary" />
      </div>
    </div>
  );
}
