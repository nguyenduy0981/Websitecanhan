import { Star } from "lucide-react";
import { describe, expect, it } from "vitest";
import { toBadge, toCollectionItem, toJourneyEvent, toUnlockedAchievement } from "./unlocks";
import type { AchievementDefinition } from "@/vo-tri/profile/achievements";
import type { BadgeDefinition } from "@/vo-tri/profile/badges";
import type { CollectionDefinition } from "@/vo-tri/profile/collection";
import type { Database } from "@/vo-tri/server/supabase/database.types";

const achievementDef: AchievementDefinition = { id: "first-play", name: "Cú Chạm Đầu Tiên", description: "Test", icon: Star };
const badgeDef: BadgeDefinition = { id: "welcome", name: "Khởi Đầu", description: "Test", icon: Star, rarity: "common" };
const collectionDef: CollectionDefinition = { id: "vo-tri-shirt", name: "Áo Vô Tri", kind: "skin", icon: Star };

describe("toUnlockedAchievement", () => {
  it("merges the DB row's unlockedAt with the catalog's name/description/icon", () => {
    const result = toUnlockedAchievement({ achievement_id: "first-play", unlocked_at: "2026-07-01T00:00:00.000Z" }, [achievementDef]);
    expect(result).toEqual({
      id: "first-play",
      name: "Cú Chạm Đầu Tiên",
      description: "Test",
      icon: Star,
      unlockedAt: new Date("2026-07-01T00:00:00.000Z"),
    });
  });

  it("returns null for an id not present in the catalog rather than a bogus icon", () => {
    expect(toUnlockedAchievement({ achievement_id: "not-real", unlocked_at: "2026-07-01T00:00:00.000Z" }, [achievementDef])).toBeNull();
  });
});

describe("toBadge", () => {
  it("marks unlocked=true when a matching row exists", () => {
    expect(toBadge(badgeDef, [{ unlocked_at: "2026-07-01T00:00:00.000Z" }])).toEqual({
      id: "welcome",
      name: "Khởi Đầu",
      description: "Test",
      icon: Star,
      rarity: "common",
      unlocked: true,
    });
  });

  it("marks unlocked=false when no row exists — the locked-placeholder case BadgeCollection renders", () => {
    expect(toBadge(badgeDef, []).unlocked).toBe(false);
  });
});

describe("toCollectionItem", () => {
  it("marks unlocked=true/false from whether an unlock row exists", () => {
    expect(toCollectionItem(collectionDef, [{ unlocked_at: "2026-07-01T00:00:00.000Z" }]).unlocked).toBe(true);
    expect(toCollectionItem(collectionDef, []).unlocked).toBe(false);
  });
});

describe("toJourneyEvent", () => {
  it("maps occurred_at -> date", () => {
    const row: Database["public"]["Tables"]["journey_events"]["Row"] = {
      id: "j1",
      user_id: "123e4567-e89b-12d3-a456-426614174000",
      type: "milestone",
      label: "Đạt cột mốc Kiên Trì",
      occurred_at: "2026-07-01T00:00:00.000Z",
    };
    expect(toJourneyEvent(row)).toEqual({
      id: "j1",
      type: "milestone",
      label: "Đạt cột mốc Kiên Trì",
      date: new Date("2026-07-01T00:00:00.000Z"),
    });
  });
});
