import { Pause, Play, X } from "lucide-react";
import { ProgressBar } from "@/vo-tri/ui/ProgressBar";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * The one in-game HUD every future Activity shares — title, exit, pause,
 * progress, timer, score. Timer/score/progress are each independently
 * optional (`undefined` hides the row) since not every Activity needs
 * all three — a memory-card game might not need a running score, a
 * reflex game might not need a progress bar.
 */
export function GameHeader({
  title,
  paused,
  onPause,
  onResume,
  onExit,
  elapsedSeconds,
  score,
  progress,
}: {
  title: string;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
  elapsedSeconds?: number;
  score?: number;
  progress?: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Thoát"
          className="vt-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-full text-vt-text-secondary hover:bg-vt-surface hover:text-vt-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
        >
          <X className="h-5 w-5" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-center font-vt-display text-base font-semibold text-vt-text-primary">
          {title}
        </h1>

        <button
          type="button"
          onClick={paused ? onResume : onPause}
          aria-label={paused ? "Tiếp tục" : "Tạm dừng"}
          className="vt-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-full text-vt-text-secondary hover:bg-vt-surface hover:text-vt-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
        >
          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>
      </div>

      {progress !== undefined && <ProgressBar percent={progress} />}

      {(elapsedSeconds !== undefined || score !== undefined) && (
        <div className="flex items-center justify-between text-sm text-vt-text-secondary">
          {elapsedSeconds !== undefined && <span>⏱ {formatTime(elapsedSeconds)}</span>}
          {score !== undefined && (
            <span>
              Điểm: <span className="font-semibold text-vt-text-primary">{score}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
