import { Crown, Flame, Gift, Sparkles, Star, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeRarity } from "./types";

/**
 * Real game-design catalog content, same status as `achievements.ts` —
 * mirrored into `badge_definitions` by
 * `supabase/migrations/20260724000013_unlocks_catalog_seed.sql`. Unlike
 * Achievements (only the unlocked ones ever render), `BadgeCollection`
 * shows the *entire* catalog with a locked placeholder for anything not
 * yet earned, so this list — 2 per rarity, escalating in difficulty — is
 * exactly what every visitor's badge shelf looks like on day one.
 */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: BadgeRarity;
}

export const badgeCatalog: BadgeDefinition[] = [
  { id: "welcome", name: "Khởi Đầu", description: "Tạo tài khoản VÔ TRI", icon: Star, rarity: "common" },
  { id: "first-reward", name: "Món Quà Đầu Tiên", description: "Nhận phần thưởng đầu tiên", icon: Gift, rarity: "common" },
  { id: "golden-streak", name: "Chuỗi Vàng", description: "Điểm danh 30 ngày liên tiếp", icon: Flame, rarity: "rare" },
  { id: "combo-king", name: "Vua Combo", description: "Đạt combo x10 trong một lượt chơi", icon: Sparkles, rarity: "rare" },
  { id: "legend", name: "Huyền Thoại Vô Tri", description: "Đạt hạng Huyền Thoại Vô Tri", icon: Crown, rarity: "special" },
  { id: "top-three", name: "Đỉnh Bảng Xếp Hạng", description: "Lọt top 3 bảng xếp hạng toàn cầu", icon: Trophy, rarity: "special" },
];
