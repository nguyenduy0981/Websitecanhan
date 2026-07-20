"use client";

import { Compass, Sparkles, Trophy, User } from "lucide-react";
import Link from "next/link";
import { toast } from "@/vo-tri/ui/toast";

const items = [
  { href: "/explore", label: "Khám phá", icon: Compass },
  { label: "Điểm danh", icon: Sparkles, isCheckIn: true as const },
  { href: "/leaderboard", label: "Xếp hạng", icon: Trophy },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

function fireCheckIn() {
  toast({ variant: "success", title: "+15 Điểm Vô Tri", description: "Điểm danh hôm nay thành công. Mai quay lại nhé!" });
}

export function QuickAccess() {
  return (
    <div id="quick-access" className="grid scroll-mt-24 grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const body = (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-vt-full bg-vt-card text-vt-primary shadow-vt-1 transition-transform duration-150 group-hover:scale-105">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-vt-text-secondary">{item.label}</span>
          </>
        );

        return item.isCheckIn ? (
          <button
            key={item.label}
            type="button"
            onClick={fireCheckIn}
            className="vt-interactive group flex flex-col items-center gap-2 rounded-vt-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
          >
            {body}
          </button>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="vt-interactive group flex flex-col items-center gap-2 rounded-vt-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
          >
            {body}
          </Link>
        );
      })}
    </div>
  );
}
