import type { HTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

/**
 * The one place page content width is decided. `app` (default) fits
 * card grids/dashboards; `prose` is narrower for long-form reading
 * (gift/article-style text) — "đọc lâu phải thoải mái" per the brief.
 */
export function Container({
  size = "app",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: "app" | "prose" }) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6", size === "app" ? "max-w-6xl" : "max-w-2xl", className)}
      {...props}
    />
  );
}
