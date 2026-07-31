import { Flame, Gamepad2, Layers, MessageCircle, Moon, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Real game-design catalog content — same status as Explore's
 * `activities.ts` / Retention's `quests.ts`/`milestones.ts`, not the
 * fabricated *data* CLAUDE.md's rule targets. Achievements are one-off
 * notable events (distinct from Milestones' long-term streak/
 * activities-played ladder, which already covers ongoing progression
 * under a different name) — mirrored into `achievement_definitions` by
 * `supabase/migrations/20260724000013_unlocks_catalog_seed.sql`. The
 * *granting* rules (when exactly a user earns one) are deliberately not
 * designed yet — see docs/BACKEND_ARCHITECTURE.md §10 — so today every
 * real user's achievement list is honestly empty regardless of this
 * catalog existing, same as Explore's catalog existing before any real
 * play history did.
 */
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const achievementCatalog: AchievementDefinition[] = [
  { id: "first-play", name: "Cú Chạm Đầu Tiên", description: "Hoàn thành hoạt động đầu tiên trên VÔ TRI", icon: Gamepad2 },
  { id: "all-rounder", name: "Thử Hết Một Lượt", description: "Đã chơi thử toàn bộ hoạt động hiện có", icon: Layers },
  { id: "combo-five", name: "Không Thể Cản", description: "Đạt combo x5 trong một lượt chơi", icon: Zap },
  { id: "streak-week", name: "Một Tuần Vô Tri", description: "Điểm danh đủ 7 ngày liên tiếp", icon: Flame },
  { id: "night-owl", name: "Cú Đêm", description: "Chơi một hoạt động sau nửa đêm", icon: Moon },
  { id: "first-comment", name: "Lên Tiếng", description: "Để lại bình luận đầu tiên", icon: MessageCircle },
];
