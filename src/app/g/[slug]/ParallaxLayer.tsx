"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Subtle decorative-layer scroll parallax — translateY only, rAF-throttled,
 * a passive scroll listener, and fully disabled under prefers-reduced-motion
 * (checked once before ever attaching a listener, so reduced-motion users
 * pay zero JS cost for this). Purely decorative: never intercepts pointer
 * events, never affects layout/CLS. */
export function ParallaxLayer({ children, speed = 0.15 }: { children: ReactNode; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const node = ref.current;
        if (node) {
          node.style.transform = `translateY(${window.scrollY * speed}px)`;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-0 will-change-transform" aria-hidden="true">
      {children}
    </div>
  );
}
