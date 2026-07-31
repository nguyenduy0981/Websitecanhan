import { Mascot } from "@/vo-tri/ui/Mascot";
import { QuestCard } from "./QuestCard";
import type { QuestDefinition, QuestProgress } from "./types";

/**
 * `progressByQuestId` absent entirely (not just empty) is the "not
 * logged in" signal each QuestCard renders honestly — see QuestCard's
 * own doc. An empty `quests` array (shouldn't happen with a real catalog
 * behind it, but every list in this codebase defends against it anyway)
 * gets the same on-brand empty treatment as everywhere else.
 */
export function QuestList({
  quests,
  progressByQuestId,
  onClaim,
}: {
  quests: QuestDefinition[];
  progressByQuestId?: Record<string, QuestProgress>;
  onClaim?: (quest: QuestDefinition) => void;
}) {
  if (quests.length === 0) {
    return (
      <div className="vt-fade-up flex flex-col items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card py-10 text-center">
        <Mascot mood="sleepy" size="md" />
        <div>
          <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Chưa có nhiệm vụ nào cả</p>
          <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">Quay lại sau, sẽ có nhiệm vụ mới sớm thôi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} progress={progressByQuestId?.[quest.id]} onClaim={onClaim} />
      ))}
    </div>
  );
}
