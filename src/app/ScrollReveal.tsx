"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveals `children` (fade + translateY, via the .lb-scroll-reveal CSS in
 * globals.css) once they scroll into view — a single IntersectionObserver
 * per instance, not a per-frame scroll handler. If IntersectionObserver
 * is unavailable for any reason, content just renders visible
 * immediately (graceful degradation, never hides real content).
 */
export function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lb-scroll-reveal ${visible ? "is-visible" : ""}`}>
      {children}
    </div>
  );
}
