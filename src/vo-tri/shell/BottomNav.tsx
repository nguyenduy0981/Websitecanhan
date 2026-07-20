"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "@/vo-tri/ui/toast";
import { cn } from "@/vo-tri/lib/cn";
import { navItems } from "./nav-items";

/**
 * A raised center action splits the 4 nav items into two pairs — reads as
 * "designed", not a stock Android/iOS/shadcn tab bar. Floats above the
 * edge (rounded-full, inset margin) rather than a flush full-width bar,
 * for the same reason. Mobile only — Sidebar takes over at md+.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [left, right] = [navItems.slice(0, 2), navItems.slice(2)];

  function fireCheckIn() {
    // Demonstrates the brand's signature reward-toast pattern (Design
    // Bible § Toast). No backend check-in exists yet — this does not
    // persist or claim a real reward, it shows what the moment will feel
    // like once Quests/XP ship.
    toast({
      variant: "success",
      title: "+15 Điểm Vô Tri",
      description: "Điểm danh hôm nay thành công. Mai quay lại nhé!",
    });
  }

  return (
    <nav
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm items-center justify-between rounded-vt-full border border-vt-glass-border bg-vt-glass px-3 py-2 shadow-vt-4 backdrop-blur-vt-md md:hidden"
      aria-label="Điều hướng chính"
    >
      {left.map((item) => (
        <NavIcon key={item.href} item={item} active={pathname === item.href} />
      ))}

      <button
        type="button"
        onClick={fireCheckIn}
        aria-label="Điểm danh hôm nay"
        className="vt-interactive vt-pulse-glow -mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-vt-full bg-vt-gradient-brand text-vt-on-accent shadow-vt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {right.map((item) => (
        <NavIcon key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function NavIcon({ item, active }: { item: (typeof navItems)[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className="vt-interactive flex h-11 w-11 items-center justify-center rounded-vt-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-vt-full transition-colors duration-150",
          active ? "bg-vt-primary/15 text-vt-primary" : "text-vt-text-secondary",
        )}
      >
        <Icon className={cn("h-5 w-5 transition-transform duration-150", active && "scale-110")} />
      </span>
    </Link>
  );
}
