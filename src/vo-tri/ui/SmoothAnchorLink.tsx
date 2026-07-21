"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

/**
 * For the two "jump down the page" CTAs (Home → Quick Access, Explore →
 * activity grid). Deliberately NOT a global `html { scroll-behavior:
 * smooth }` — that would also smooth-animate Next.js's own scroll-to-top
 * on every route change, a separate and unwanted effect. This scrolls
 * smoothly only on an explicit click of one of these two anchors, and
 * falls back to an instant jump under prefers-reduced-motion.
 */
export const SmoothAnchorLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ href, onClick, ...props }, ref) => {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);
      if (!href?.startsWith("#")) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    return <a ref={ref} href={href} onClick={handleClick} {...props} />;
  },
);
SmoothAnchorLink.displayName = "SmoothAnchorLink";
