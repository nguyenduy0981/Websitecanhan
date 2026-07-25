import type { Achievement, CollectionItem, JourneyEvent, ProfileBadge } from "@/vo-tri/profile/types";
import type { AchievementDefinition } from "@/vo-tri/profile/achievements";
import type { BadgeDefinition } from "@/vo-tri/profile/badges";
import type { CollectionDefinition } from "@/vo-tri/profile/collection";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type JourneyEventRow = Database["public"]["Tables"]["journey_events"]["Row"];

/**
 * `Achievement.icon`/`ProfileBadge.icon`/`CollectionItem.icon` are
 * `LucideIcon` component references — real content the frontend already
 * authors in achievements.ts/badges.ts/collection.ts (mirrored into the DB
 * only for FK integrity, same status as activities/quests/milestones).
 * These adapters merge a DB row (which id got unlocked, and when) with
 * that catalog by id — never trust an id the DB returns that isn't in the
 * catalog (falls back to skipping the row rather than a bogus icon).
 */

export function toUnlockedAchievement(
  row: { achievement_id: string; unlocked_at: string },
  catalog: readonly AchievementDefinition[],
): Achievement | null {
  const def = catalog.find((a) => a.id === row.achievement_id);
  if (!def) return null;
  return { id: def.id, name: def.name, description: def.description, icon: def.icon, unlockedAt: new Date(row.unlocked_at) };
}

export function toBadge(def: BadgeDefinition, unlockedRows: { unlocked_at: string }[]): ProfileBadge {
  return { id: def.id, name: def.name, description: def.description, icon: def.icon, rarity: def.rarity, unlocked: unlockedRows.length > 0 };
}

export function toCollectionItem(def: CollectionDefinition, unlockedRows: { unlocked_at: string }[]): CollectionItem {
  return { id: def.id, name: def.name, kind: def.kind, icon: def.icon, unlocked: unlockedRows.length > 0 };
}

export function toJourneyEvent(row: JourneyEventRow): JourneyEvent {
  return { id: row.id, type: row.type, label: row.label, date: new Date(row.occurred_at) };
}
