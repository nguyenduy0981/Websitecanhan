import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class lists AND resolve conflicting Tailwind utilities
// (e.g. cn("p-2", condition && "p-4") keeps only "p-4"). Every VÔ TRI
// component takes an optional `className` prop and threads it through
// this so callers can override without fighting specificity.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
