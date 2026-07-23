import { Flame, Pause, Play, X } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import { ProgressBar } from "@/vo-tri/ui/ProgressBar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/vo-tri/ui/Tooltip";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * The one in-game HUD every future Activity shares — title, exit, pause,
 * progress, timer, combo, score. All of the stat row entries are
 * independently optional (`undefined` hides that one) since not every
 * Activity needs all of them — a memory-card game might not need a
 * running score, a reflex game might not need a progress bar.
 * `remainingSeconds` (countdown) takes over the timer slot from
 * `elapsedSeconds` (count-up) when the Engine's `rules.timeLimitSeconds`
 * is set — GameFrame only ever passes one of the two.
 */
export function GameHeader({
  title,
  paused,
  onPause,
  onResume,
  onExit,
  elapsedSeconds,
  remainingSeconds,
  combo,
  score,
  progress,
}: {
  title: string;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  combo?: number;
  score?: number;
  progress?: number;
}) {
  const timeValue = remainingSeconds ?? elapsedSeconds;
  const isLowTime = remainingSeconds !== undefined && remainingSeconds <= 10;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onExit}
              aria-label="Thoát"
              className="vt-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-full text-vt-text-secondary hover:bg-vt-surface hover:text-vt-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Thoát</TooltipContent>
        </Tooltip>

        <h1 className="min-w-0 flex-1 truncate text-center font-vt-display text-base font-semibold text-vt-text-primary">
          {title}
        </h1>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={paused ? onResume : onPause}
              aria-label={paused ? "Tiếp tục" : "Tạm dừng"}
              className="vt-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-full text-vt-text-secondary hover:bg-vt-surface hover:text-vt-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
            >
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{paused ? "Tiếp tục" : "Tạm dừng"}</TooltipContent>
        </Tooltip>
      </div>

      {progress !== undefined && <ProgressBar percent={progress} />}

      {(timeValue !== undefined || combo !== undefined || score !== undefined) && (
        <div className="flex items-center justify-between text-sm text-vt-text-secondary">
          {timeValue !== undefined && (
            <span className={cn(isLowTime && "font-semibold text-vt-danger")}>⏱ {formatTime(timeValue)}</span>
          )}
          {combo !== undefined && combo > 0 && (
            <span className="flex items-center gap-1 font-semibold text-vt-warning">
              <Flame className="h-4 w-4" aria-hidden /> Combo x{combo}
            </span>
          )}
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
