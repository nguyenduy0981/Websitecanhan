import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/vo-tri/lib/cn";

/**
 * Card is the most-repeated surface in the product, so it carries the
 * most of the brand's tactile personality: a resting shadow that reads
 * as "sitting slightly above the page" and a hover state that lifts it
 * further (via `.vt-interactive`, shared with Button/Input so every
 * raised surface in the app moves the same way).
 *
 * `glass` exists because the brief calls for a glass effect in the
 * system, but per "có thể dùng glass nhưng tiết chế" (use it, sparingly)
 * it is NOT the default — reach for it only on overlays sitting on top of
 * busy content (a floating nav, a sheet header), not as a general content
 * card, or every screen turns into a blur soup.
 */
const cardVariants = cva("rounded-vt-lg border transition-shadow duration-vt-fast ease-vt-out", {
  variants: {
    variant: {
      default: "border-vt-border bg-vt-card shadow-vt-1",
      elevated: "vt-interactive border-vt-border bg-vt-card shadow-vt-2 hover:shadow-vt-3",
      glass: "border-vt-glass-border bg-vt-glass backdrop-blur-vt-md",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
));
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-vt-display text-lg font-semibold text-vt-text-primary", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-vt-text-secondary", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-vt-text-primary", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4 flex items-center gap-3", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
