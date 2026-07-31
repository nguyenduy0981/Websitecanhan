"use client";

import { useEffect, useRef } from "react";
import { Mascot } from "@/vo-tri/ui/Mascot";

const PARALLAX_MAX_PX = 14;
const SHRINK_SCROLL_RANGE_PX = 320;

/**
 * Two independent, rAF-throttled effects, each mutating its own element's
 * style directly (no React state) so neither causes a re-render per
 * frame: the outer ref scales/fades on scroll ("hero thu nhỏ nhẹ"), the
 * inner ref nudges toward the pointer ("mascot nhìn theo chuột"). They
 * compose naturally since they're on different (nested) elements instead
 * of fighting over one `transform`.
 *
 * Both are skipped entirely under prefers-reduced-motion — not just
 * shortened, since a "moves toward your cursor" effect is exactly the
 * category of motion that setting exists to opt out of.
 */
export function HeroScene({ children }: { children: React.ReactNode }) {
  const shrinkRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let scrollTicking = false;
    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / SHRINK_SCROLL_RANGE_PX, 1);
        const el = shrinkRef.current;
        if (el) {
          el.style.transform = `scale(${1 - progress * 0.12})`;
          el.style.opacity = `${1 - progress * 0.35}`;
        }
        scrollTicking = false;
      });
    }

    let pointerTicking = false;
    let lastX = 0;
    let lastY = 0;
    function onPointerMove(e: PointerEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (pointerTicking) return;
      pointerTicking = true;
      requestAnimationFrame(() => {
        const el = parallaxRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = Math.max(-1, Math.min(1, (lastX - cx) / (window.innerWidth / 2)));
          const dy = Math.max(-1, Math.min(1, (lastY - cy) / (window.innerHeight / 2)));
          el.style.transform = `translate(${dx * PARALLAX_MAX_PX}px, ${dy * PARALLAX_MAX_PX}px)`;
        }
        pointerTicking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={shrinkRef} style={{ willChange: "transform, opacity" }}>
      <div ref={parallaxRef} style={{ willChange: "transform" }} className="transition-transform duration-vt-fast ease-vt-out">
        {children}
      </div>
    </div>
  );
}

export function HeroMascot() {
  return <Mascot mood="celebrating" size="xl" className="h-32 w-32 sm:h-40 sm:w-40" />;
}
