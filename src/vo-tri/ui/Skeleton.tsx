import type { HTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

/** A shimmering placeholder block — see .vt-skeleton in motion.css. Pass explicit width/height via className (e.g. "h-4 w-2/3"). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("vt-skeleton h-4 w-full", className)} {...props} />;
}
