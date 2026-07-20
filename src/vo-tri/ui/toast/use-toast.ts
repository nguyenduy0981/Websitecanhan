"use client";

import { useEffect, useState } from "react";

export type ToastVariant = "default" | "success" | "danger" | "warning" | "info";

export interface ToastData {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant: ToastVariant;
  duration: number;
  action?: React.ReactNode;
}

type ToastInput = Omit<ToastData, "id" | "variant" | "duration"> & {
  variant?: ToastVariant;
  duration?: number;
};

// Module-level store (not React context) on purpose: `toast()` needs to be
// callable from anywhere — inside an async submit handler, a fetch
// .catch(), a non-component utility — not just from a component that
// happens to be under a provider. <Toaster/> is the single subscriber
// that renders whatever is in the queue; a hard cap keeps a burst of
// failures from ever stacking the whole viewport.
const MAX_TOASTS = 3;
const DEFAULT_DURATION = 5000;

let toasts: ToastData[] = [];
const listeners = new Set<(toasts: ToastData[]) => void>();

function emit() {
  for (const listener of listeners) listener(toasts);
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast({ variant = "default", duration = DEFAULT_DURATION, ...input }: ToastInput) {
  const id = crypto.randomUUID();
  toasts = [{ id, variant, duration, ...input }, ...toasts].slice(0, MAX_TOASTS);
  emit();
  return { id, dismiss: () => dismiss(id) };
}

export function useToasts() {
  const [state, setState] = useState<ToastData[]>(toasts);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return { toasts: state, dismiss };
}
