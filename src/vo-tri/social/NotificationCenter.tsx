import { Bell, Gift, Trophy, Users } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import { EmptyState } from "@/vo-tri/ui/StatePanel";
import type { NotificationItem, NotificationType } from "./types";

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; tone: string }> = {
  achievement: { icon: Trophy, tone: "bg-vt-reward/15 text-vt-reward" },
  reward: { icon: Gift, tone: "bg-vt-xp/15 text-vt-xp" },
  friend: { icon: Users, tone: "bg-vt-info/15 text-vt-info" },
  system: { icon: Bell, tone: "bg-vt-text-secondary/15 text-vt-text-secondary" },
};

function timeAgo(date: Date): string {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}

/**
 * Categorized (achievement/reward/friend/system) so a real notification
 * feed can be dropped in later without a redesign — today every caller
 * passes `items={[]}` (no backend), so this always shows the honest
 * empty state.
 */
export function NotificationCenter({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Yên ắng quá..."
        description="Đáng ngờ đấy. Nhưng thôi, tận hưởng sự yên bình đi — chưa có thông báo nào cả."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const { icon: Icon, tone } = TYPE_CONFIG[item.type];
        return (
          <li key={item.id} className={cn("flex items-start gap-3 rounded-vt-lg border border-vt-border bg-vt-card p-3", !item.read && "border-vt-primary/30")}>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-full", tone)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-vt-text-primary">{item.title}</p>
              <p className="text-xs text-vt-text-secondary">{item.description}</p>
              <p className="mt-1 text-[11px] text-vt-text-secondary">{timeAgo(item.createdAt)}</p>
            </div>
            {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-vt-full bg-vt-primary" aria-label="Chưa đọc" />}
          </li>
        );
      })}
    </ul>
  );
}
