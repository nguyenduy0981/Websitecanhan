import { Palette, Shirt, Sparkles, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CollectionKind } from "./types";

/**
 * Real game-design catalog content, same status as `achievements.ts`/
 * `badges.ts` — mirrored into `collection_definitions` by
 * `supabase/migrations/20260724000013_unlocks_catalog_seed.sql`. Shown
 * in full like Badges (locked placeholders included), across the same
 * 3 kinds `CollectionItem["kind"]` already models: skin/title/item.
 */
export interface CollectionDefinition {
  id: string;
  name: string;
  kind: CollectionKind;
  icon: LucideIcon;
}

export const collectionCatalog: CollectionDefinition[] = [
  { id: "vo-tri-shirt", name: "Áo Vô Tri", kind: "skin", icon: Shirt },
  { id: "ambassador-title", name: "Đại Sứ Vô Tri", kind: "title", icon: Tags },
  { id: "mystery-palette", name: "Bảng Màu Bí Ẩn", kind: "item", icon: Palette },
  { id: "golden-spin", name: "Vòng Quay Vàng", kind: "item", icon: Sparkles },
];
