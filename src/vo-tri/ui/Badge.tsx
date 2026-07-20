import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

// Every semantic color in the token system gets exactly one badge
// variant, so "what does this color mean" always has one canonical
// answer instead of being reinvented per screen.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-vt-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-vt-surface text-vt-text-secondary",
        primary: "bg-vt-primary text-vt-on-accent",
        secondary: "bg-vt-secondary text-vt-on-accent",
        success: "bg-vt-success text-vt-on-accent",
        warning: "bg-vt-warning text-vt-on-accent",
        danger: "bg-vt-danger text-vt-on-accent",
        info: "bg-vt-info text-vt-on-accent",
        reward: "bg-vt-reward text-vt-on-accent",
        xp: "bg-vt-xp text-vt-on-accent",
        vip: "bg-vt-gradient-vip text-vt-on-accent shadow-vt-glow-vip",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
