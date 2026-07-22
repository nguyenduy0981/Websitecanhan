import { Flame, Gem, Rocket, Star, Swords, Trophy } from "lucide-react";
import type { MilestoneDefinition } from "./types";

/**
 * A long-term progression ladder over two metrics (streak length,
 * activities played) — deliberately not level-based since Profile's rank
 * ladder (ranks.ts) already covers level thresholds; this would just
 * duplicate it under a different name. Real game-design content, hardcode-safe
 * like Explore's difficulty labels or Profile's rank ladder.
 */
export const milestones: MilestoneDefinition[] = [
  {
    id: "streak-3",
    title: "Khởi Động",
    description: "Chuỗi 3 ngày liên tiếp",
    metric: "streak",
    threshold: 3,
    icon: Flame,
  },
  {
    id: "streak-7",
    title: "Kiên Trì",
    description: "Chuỗi 7 ngày liên tiếp",
    metric: "streak",
    threshold: 7,
    icon: Swords,
  },
  {
    id: "streak-30",
    title: "Không Thể Cản",
    description: "Chuỗi 30 ngày liên tiếp",
    metric: "streak",
    threshold: 30,
    icon: Rocket,
  },
  {
    id: "played-10",
    title: "Bắt Đầu Vô Tri",
    description: "Đã chơi 10 hoạt động",
    metric: "activitiesPlayed",
    threshold: 10,
    icon: Star,
  },
  {
    id: "played-50",
    title: "Tay Chơi Kỳ Cựu",
    description: "Đã chơi 50 hoạt động",
    metric: "activitiesPlayed",
    threshold: 50,
    icon: Gem,
  },
  {
    id: "played-100",
    title: "Huyền Thoại Vô Tri",
    description: "Đã chơi 100 hoạt động",
    metric: "activitiesPlayed",
    threshold: 100,
    icon: Trophy,
  },
];

export function getMilestonesForMetric(metric: MilestoneDefinition["metric"]): MilestoneDefinition[] {
  return milestones.filter((m) => m.metric === metric).sort((a, b) => a.threshold - b.threshold);
}
