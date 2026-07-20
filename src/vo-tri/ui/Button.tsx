"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

/**
 * Feedback comes from three cheap, composable layers instead of a
 * pointer-tracked ripple: `.vt-interactive` (hover lift + press squash,
 * shared with Card/Input), a focus-visible ring, and — on the primary
 * variant only — an ambient `.vt-pulse-glow` so the highest-emphasis
 * action visibly invites a tap even at rest. A JS ripple would cost a
 * pointer listener + re-render per click for a sensation the CSS
 * press-scale already delivers; not worth it here.
 */
const buttonVariants = cva(
  "vt-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-vt-md font-vt-body font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg disabled:pointer-events-none disabled:opacity-40 disabled:translate-y-0",
  {
    variants: {
      variant: {
        primary: "bg-vt-primary text-vt-on-accent shadow-vt-2 hover:shadow-vt-glow-primary",
        secondary: "bg-vt-secondary text-vt-on-accent shadow-vt-2 hover:shadow-vt-glow-secondary",
        outline: "border border-vt-border bg-transparent text-vt-text-primary hover:bg-vt-surface",
        ghost: "bg-transparent text-vt-text-primary hover:bg-vt-surface",
        danger: "bg-vt-danger text-vt-on-accent shadow-vt-2",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-14 px-7 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders the child element instead of a <button> (e.g. wrapping a Link), keeping all styling/variants. */
  asChild?: boolean;
  loading?: boolean;
  /** Shown in place of children while loading; falls back to children so a bare `loading` toggle never leaves the button blank. */
  loadingLabel?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, loadingLabel, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          variant === "primary" && !disabled && !loading && "vt-pulse-glow",
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {loadingLabel ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
