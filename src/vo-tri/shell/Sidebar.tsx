"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fireCheckInToast } from "@/vo-tri/lib/check-in";
import { cn } from "@/vo-tri/lib/cn";
import { navItems } from "./nav-items";

/**
 * Desktop is a fixed left rail, not a stretched-out copy of BottomNav —
 * same nav-items/design language (pill active state, same icons, same
 * check-in action) but a layout that actually fits a pointer + wide
 * viewport: labels next to icons, the primary action as a full pill
 * button up top instead of a floating circle.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    // top-20 (not inset-y-0) so this starts below the fixed Header instead
    // of behind it — Header already owns the "VÔ TRI" wordmark site-wide,
    // this rail doesn't repeat it.
    <aside className="fixed bottom-0 left-0 top-20 z-30 hidden w-60 flex-col gap-6 border-r border-vt-border bg-vt-surface/60 p-5 backdrop-blur-vt-sm md:flex">
      <button
        type="button"
        onClick={fireCheckInToast}
        className="vt-interactive flex items-center justify-center gap-2 rounded-vt-md bg-vt-gradient-brand px-4 py-2.5 font-semibold text-vt-on-accent shadow-vt-2 hover:shadow-vt-glow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg"
      >
        <Sparkles className="h-4 w-4" />
        Điểm danh hôm nay
      </button>

      <nav className="flex flex-col gap-1" aria-label="Điều hướng chính">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "vt-interactive flex items-center gap-3 rounded-vt-md px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary",
                active ? "bg-vt-primary/15 text-vt-primary" : "text-vt-text-secondary hover:bg-vt-card hover:text-vt-text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
