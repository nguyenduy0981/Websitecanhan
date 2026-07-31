import { Calendar, Flame, Gamepad2, Trophy, Zap } from "lucide-react";
import { Card } from "@/vo-tri/ui/Card";
import type { ProfileStats } from "./types";

export function StatCards({ stats }: { stats: ProfileStats }) {
  const items = [
    { icon: Trophy, tone: "text-vt-reward", label: "Điểm", value: stats.points.toLocaleString("vi-VN") },
    { icon: Zap, tone: "text-vt-xp", label: "XP", value: stats.xp.toLocaleString("vi-VN") },
    { icon: Flame, tone: "text-vt-warning", label: "Streak", value: `${stats.streakDays} ngày` },
    { icon: Calendar, tone: "text-vt-info", label: "Ngày hoạt động", value: `${stats.activeDays}` },
    { icon: Gamepad2, tone: "text-vt-primary", label: "Đã chơi", value: `${stats.activitiesPlayed} lượt` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} variant="elevated" padding="sm" className="flex flex-col items-center gap-1.5 text-center">
          <item.icon className={`h-5 w-5 ${item.tone}`} />
          <p className="font-vt-display text-lg font-bold text-vt-text-primary">{item.value}</p>
          <p className="text-xs text-vt-text-secondary">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}
