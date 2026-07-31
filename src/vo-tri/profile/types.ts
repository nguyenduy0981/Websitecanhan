import type { LucideIcon } from "lucide-react";

export interface ProfileIdentity {
  displayName: string;
  username: string;
  avatarUrl?: string;
  tagline?: string;
  joinedAt: Date;
  online?: boolean;
}

export interface LevelProgress {
  level: number;
  xp: number;
  xpToNext: number;
}

export interface ProfileStats {
  points: number;
  level: number;
  xp: number;
  streakDays: number;
  activeDays: number;
  activitiesPlayed: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlockedAt: Date;
}

export type BadgeRarity = "common" | "rare" | "special";

export interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: BadgeRarity;
  unlocked: boolean;
}

export type JourneyEventType = "joined" | "level-up" | "achievement" | "reward" | "quest" | "milestone" | "streak";

export interface JourneyEvent {
  id: string;
  type: JourneyEventType;
  label: string;
  date: Date;
}

export type CollectionKind = "skin" | "title" | "item";

export interface CollectionItem {
  id: string;
  name: string;
  kind: CollectionKind;
  icon: LucideIcon;
  unlocked: boolean;
}
