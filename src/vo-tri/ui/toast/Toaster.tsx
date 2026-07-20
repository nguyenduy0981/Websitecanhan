"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/vo-tri/lib/cn";
import { type ToastVariant, useToasts } from "./use-toast";

const VARIANT_ICON: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const VARIANT_ACCENT: Record<ToastVariant, string> = {
  default: "text-vt-text-primary",
  success: "text-vt-success",
  danger: "text-vt-danger",
  warning: "text-vt-warning",
  info: "text-vt-info",
};

/** Mount once near the root layout so toasts are available app-wide. */
export function Toaster() {
  const { toasts, dismiss } = useToasts();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, duration, action }) => {
        const Icon = VARIANT_ICON[variant];
        return (
          <ToastPrimitive.Root
            key={id}
            duration={duration}
            onOpenChange={(open) => {
              if (!open) dismiss(id);
            }}
            className={cn(
              "vt-pop-in data-[state=closed]:vt-scale-in data-[swipe=end]:animate-none",
              "grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-vt-lg border border-vt-border bg-vt-card p-4 shadow-vt-4",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
            )}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", VARIANT_ACCENT[variant])} aria-hidden="true" />
            <div className="flex flex-col gap-1">
              {title && (
                <ToastPrimitive.Title className="font-vt-display text-sm font-semibold text-vt-text-primary">
                  {title}
                </ToastPrimitive.Title>
              )}
              {description && (
                <ToastPrimitive.Description className="text-sm text-vt-text-secondary">
                  {description}
                </ToastPrimitive.Description>
              )}
              {action}
            </div>
            <ToastPrimitive.Close
              aria-label="Đóng"
              className="vt-interactive rounded-vt-sm p-1 text-vt-text-secondary hover:text-vt-text-primary"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex w-full max-w-sm list-none flex-col gap-2 p-4 outline-none sm:bottom-4 sm:right-4" />
    </ToastPrimitive.Provider>
  );
}
