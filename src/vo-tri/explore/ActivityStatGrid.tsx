import { Clock3, RotateCcw, Trophy, Zap } from "lucide-react";
import { DIFFICULTY_LABEL, type Activity } from "./types";

/**
 * Shared between Explore's ActivityDetailSheet (a quick preview) and the
 * gameplay framework's PreGameScreen (the real pre-game step) — same
 * activity facts, same layout, one implementation instead of two.
 */
export function ActivityStatGrid({ activity }: { activity: Activity }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <Stat icon={<Trophy className="h-4 w-4 text-vt-reward" />} label="Phần thưởng" value={`${activity.reward} điểm`} />
      <Stat icon={<Zap className="h-4 w-4 text-vt-xp" />} label="XP" value={`+${activity.xp}`} />
      <Stat icon={<Clock3 className="h-4 w-4 text-vt-text-secondary" />} label="Thời gian" value={`~${activity.estMinutes} phút`} />
      <Stat icon={<RotateCcw className="h-4 w-4 text-vt-text-secondary" />} label="Độ khó" value={DIFFICULTY_LABEL[activity.difficulty]} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-vt-md border border-vt-border bg-vt-surface p-2.5">
      {icon}
      <div>
        <p className="text-[11px] text-vt-text-secondary">{label}</p>
        <p className="font-medium text-vt-text-primary">{value}</p>
      </div>
    </div>
  );
}
