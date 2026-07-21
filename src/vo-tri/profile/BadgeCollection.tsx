import { Lock } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import type { BadgeRarity, ProfileBadge } from "./types";

const RARITY_RING: Record<BadgeRarity, string> = {
  common: "border-vt-border",
  rare: "border-vt-secondary shadow-vt-glow-secondary",
  special: "border-vt-vip shadow-vt-glow-vip",
};

export function BadgeCollection({ badges }: { badges: ProfileBadge[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Huy hiệu</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            title={badge.unlocked ? badge.description : "Chưa mở khóa"}
            className={cn(
              "vt-interactive flex flex-col items-center gap-1.5 rounded-vt-lg border-2 bg-vt-card p-3 text-center",
              badge.unlocked ? RARITY_RING[badge.rarity] : "border-vt-border opacity-50",
            )}
          >
            <span
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-vt-full",
                badge.unlocked ? "bg-vt-primary/15 text-vt-primary" : "bg-vt-surface text-vt-text-secondary",
              )}
            >
              <badge.icon className="h-5 w-5" />
              {!badge.unlocked && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-vt-full border border-vt-border bg-vt-surface">
                  <Lock className="h-2.5 w-2.5 text-vt-text-secondary" />
                </span>
              )}
            </span>
            <p className="text-[11px] font-medium text-vt-text-primary">{badge.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
