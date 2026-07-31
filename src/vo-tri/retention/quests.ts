import { Gamepad2, MessageCircle, Sparkles, Target, Zap } from "lucide-react";
import { dayOfYear } from "@/vo-tri/lib/date";
import type { QuestDefinition } from "./types";

/**
 * Real authored quest/goal design content — same status as Explore's
 * activity catalog (CLAUDE.md's no-fabrication rule targets fake
 * *social/usage* signals, not designed game content like this). Daily
 * quests rotate one "bonus" slot day-to-day from a pool via the same
 * day-seed pattern already used for Home's daily message and Explore's
 * Featured Activity/Daily Picks; the two "core" dailies (check in, play
 * something) stay constant so the panel doesn't feel randomly reshuffled
 * every visit.
 */
const CORE_DAILY_QUESTS: QuestDefinition[] = [
  {
    id: "daily-check-in",
    title: "Điểm danh hôm nay",
    description: "Ghé qua điểm danh, nhận điểm cho có khí thế.",
    cadence: "daily",
    target: 1,
    unit: "lần điểm danh",
    reward: 15,
    xp: 10,
    icon: Sparkles,
  },
  {
    id: "daily-play-two",
    title: "Chơi 2 hoạt động",
    description: "Thử sức với 2 trò bất kỳ trong Khám phá.",
    cadence: "daily",
    target: 2,
    unit: "hoạt động",
    reward: 20,
    xp: 15,
    icon: Gamepad2,
  },
];

const DAILY_BONUS_POOL: QuestDefinition[] = [
  {
    id: "daily-earn-points",
    title: "Đạt 50 điểm trong ngày",
    description: "Cứ chơi tiếp, điểm tự khắc cộng dồn.",
    cadence: "daily",
    target: 50,
    unit: "điểm",
    reward: 25,
    xp: 10,
    icon: Target,
  },
  {
    id: "daily-try-new",
    title: "Thử một hoạt động mới",
    description: "Một trò bạn chưa từng chơi — xem sao.",
    cadence: "daily",
    target: 1,
    unit: "hoạt động mới",
    reward: 20,
    xp: 20,
    icon: Zap,
  },
  {
    id: "daily-react",
    title: "Thả cảm xúc cho 1 bài viết",
    description: "Ghé bảng tin, để lại một reaction bất kỳ.",
    cadence: "daily",
    target: 1,
    unit: "reaction",
    reward: 10,
    xp: 5,
    icon: MessageCircle,
  },
];

export const weeklyGoals: QuestDefinition[] = [
  {
    id: "weekly-play-ten",
    title: "Chơi 10 hoạt động trong tuần",
    description: "Không cần dồn hết một ngày — rải đều cả tuần.",
    cadence: "weekly",
    target: 10,
    unit: "hoạt động",
    reward: 100,
    xp: 80,
    icon: Gamepad2,
  },
  {
    id: "weekly-streak",
    title: "Duy trì chuỗi 7 ngày",
    description: "Ghé mỗi ngày trong tuần, đừng để đứt chuỗi.",
    cadence: "weekly",
    target: 7,
    unit: "ngày liên tiếp",
    reward: 150,
    xp: 100,
    icon: Sparkles,
  },
  {
    id: "weekly-earn-points",
    title: "Kiếm 300 điểm trong tuần",
    description: "Điểm từ mọi hoạt động đều tính hết.",
    cadence: "weekly",
    target: 300,
    unit: "điểm",
    reward: 120,
    xp: 90,
    icon: Target,
  },
];

/** Today's daily quest set: the 2 constant ones + 1 rotating bonus, day-seeded (same algorithm as Explore's getFeaturedActivity). */
export function getDailyQuests(date: Date = new Date()): QuestDefinition[] {
  const bonus = DAILY_BONUS_POOL[dayOfYear(date) % DAILY_BONUS_POOL.length]!;
  return [...CORE_DAILY_QUESTS, bonus];
}
