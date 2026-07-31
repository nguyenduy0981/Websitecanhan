import { Mascot } from "@/vo-tri/ui/Mascot";
import { CourtTrialCard } from "./CourtTrialCard";
import type { CourtTrial } from "./types";

/** Every trial the user is a party to — real, honest empty state (same pattern as Leaderboard's "chưa ai đủ vô tri") when nobody's been dragged to Toà yet. */
export function CourtTrialList({
  trials,
  currentUserId,
  onAnswer,
}: {
  trials: CourtTrial[];
  currentUserId: string;
  onAnswer?: (trial: CourtTrial) => void;
}) {
  if (trials.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-vt-lg border border-dashed border-vt-border py-10 text-center">
        <Mascot mood="sleepy" size="lg" />
        <div>
          <p className="font-vt-display text-base font-semibold text-vt-text-primary">Toà chưa có phiên xử nào</p>
          <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">Đưa một người bạn ra Toà, hoặc chờ ai đó đưa bạn ra trước.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {trials.map((trial) => (
        <CourtTrialCard key={trial.id} trial={trial} currentUserId={currentUserId} onAnswer={onAnswer} />
      ))}
    </div>
  );
}
