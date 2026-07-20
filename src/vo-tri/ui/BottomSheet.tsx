"use client";

import { Drawer } from "vaul";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cn } from "@/vo-tri/lib/cn";

/**
 * Mobile-first by construction, not a modal squeezed onto small screens:
 * vaul gives real swipe-to-dismiss + a spring physics drag, which matches
 * "Mobile là ưu tiên số một" far better than a Dialog with different
 * breakpoint styling would.
 */
export const BottomSheet = Drawer.Root;
export const BottomSheetTrigger = Drawer.Trigger;
export const BottomSheetClose = Drawer.Close;

export const BottomSheetContent = forwardRef<
  ElementRef<typeof Drawer.Content>,
  ComponentPropsWithoutRef<typeof Drawer.Content>
>(({ className, children, ...props }, ref) => (
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 z-50 bg-vt-bg/80 backdrop-blur-vt-sm" />
    <Drawer.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-vt-xl border-t border-vt-border bg-vt-card p-6 pt-3 shadow-vt-4",
        className,
      )}
      {...props}
    >
      <Drawer.Handle className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-vt-full bg-vt-border" />
      {children}
    </Drawer.Content>
  </Drawer.Portal>
));
BottomSheetContent.displayName = "BottomSheetContent";

/** vaul requires an accessible title; pass `hidden` when the visual header already conveys it. */
export function BottomSheetTitle({
  children,
  hidden,
  className,
}: {
  children: ReactNode;
  hidden?: boolean;
  className?: string;
}) {
  return (
    <Drawer.Title className={cn(hidden ? "sr-only" : "font-vt-display text-lg font-semibold text-vt-text-primary", className)}>
      {children}
    </Drawer.Title>
  );
}

export function BottomSheetDescription({ className, ...props }: ComponentPropsWithoutRef<typeof Drawer.Description>) {
  return <Drawer.Description className={cn("text-sm text-vt-text-secondary", className)} {...props} />;
}
