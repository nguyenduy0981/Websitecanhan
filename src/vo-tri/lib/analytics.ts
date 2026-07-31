/**
 * Analytics-ready architecture, same pattern as lib/sound.ts: every
 * gameplay lifecycle moment worth measuring later (session start, exit,
 * result) calls `trackEvent()` today. It's a no-op — no analytics
 * provider is wired up, and none is needed to ship the Engine — but
 * wiring a real one later is a one-file change here, not a hunt through
 * every component that should report something.
 */
export type AnalyticsEvent = "activity_start" | "activity_exit" | "activity_result";

export function trackEvent(_event: AnalyticsEvent, _payload?: Record<string, unknown>) {
  // Intentionally a no-op until a real analytics provider exists.
}
