"use client";

import { getDailyQuests } from "./quests";
import { QuestList } from "./QuestList";

/**
 * Takes zero props on purpose. `QuestDefinition.icon` is a `LucideIcon`
 * component reference, which can't cross the Server→Client boundary
 * (the same real bug `next build` caught for `/play/[activityId]` in the
 * Gameplay Framework — see that route's own comment). Rather than have
 * Home's Server Component page compute the day-seeded catalog and pass
 * it down, this looks it up itself client-side from the same importable
 * module — `getDailyQuests()` is pure and works identically either side.
 */
export function DailyQuestPreview() {
  return <QuestList quests={getDailyQuests()} />;
}
