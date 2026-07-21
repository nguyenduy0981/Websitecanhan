import { Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import type { RankChange } from "./types";

const CONFIG: Record<RankChange, { icon: typeof TrendingUp; tone: string; label: string }> = {
  up: { icon: TrendingUp, tone: "text-vt-success", label: "Tăng hạng" },
  down: { icon: TrendingDown, tone: "text-vt-danger", label: "Giảm hạng" },
  same: { icon: Minus, tone: "text-vt-text-secondary", label: "Giữ nguyên hạng" },
  new: { icon: Sparkles, tone: "text-vt-secondary", label: "Mới lên bảng" },
};

/** Never color-only — an icon + accessible label always pairs with the tone, per the a11y rule "không dùng màu sắc làm tín hiệu duy nhất". */
export function RankChangeIcon({ change }: { change: RankChange }) {
  const { icon: Icon, tone, label } = CONFIG[change];
  return (
    <span className={cn("inline-flex items-center", tone)} aria-label={label} title={label}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
