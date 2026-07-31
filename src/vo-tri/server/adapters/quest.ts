import type { QuestProgress } from "@/vo-tri/retention/types";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type QuestProgressRow = Database["public"]["Tables"]["quest_progress"]["Row"];

export function toQuestProgress(row: QuestProgressRow): QuestProgress {
  return {
    questId: row.quest_id,
    current: row.current_value,
    claimed: row.claimed_at !== null,
  };
}
