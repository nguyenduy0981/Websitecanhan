import { LoadingState } from "@/vo-tri/ui";

// Next's file-based convention — shown automatically during route/data
// suspense, no manual wiring needed per page.
export default function Loading() {
  return <LoadingState className="min-h-[60vh] justify-center" />;
}
