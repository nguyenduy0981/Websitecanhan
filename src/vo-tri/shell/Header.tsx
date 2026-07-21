"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/vo-tri/ui/Avatar";
import { Badge } from "@/vo-tri/ui/Badge";
import { Button } from "@/vo-tri/ui/Button";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { cn } from "@/vo-tri/lib/cn";
import type { VoTriUser } from "./types";
import { NotificationBell } from "./NotificationBell";

const SCROLL_THRESHOLD = 24;

/** rAF-throttled scroll listener (one boolean flip, not a per-frame layout read) — cheaper than IntersectionObserver's extra sentinel element for a single threshold check. */
function useScrolled(threshold: number) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

export function Header({ user }: { user?: VoTriUser }) {
  const scrolled = useScrolled(SCROLL_THRESHOLD);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[padding,box-shadow,background-color,backdrop-filter] duration-vt-fast ease-vt-out",
        scrolled ? "border-b border-vt-glass-border bg-vt-glass py-2 shadow-vt-2 backdrop-blur-vt-md" : "border-b border-transparent bg-transparent py-4",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="vt-interactive flex items-center gap-2 rounded-vt-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary">
          <Mascot mood="happy" size="sm" animate={false} />
          <span className="font-vt-display text-lg font-extrabold tracking-tight text-vt-text-primary">VÔ TRI</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <Badge variant="reward" className="hidden sm:inline-flex">
              {user.points.toLocaleString("vi-VN")} điểm
            </Badge>
            <NotificationBell />
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size={36} className="border border-vt-border" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button size="sm" variant="primary">
              Đăng nhập
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
