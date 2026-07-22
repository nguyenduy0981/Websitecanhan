/**
 * Sound-ready architecture: every "moment" that should eventually have a
 * sound effect (reward reveal, level up, achievement unlock, game
 * start/exit) calls `playSound()` with a named event today. It's a no-op
 * — no audio files exist yet, and none are needed to ship this
 * framework — but wiring real audio later is a one-file change here,
 * not a hunt through every component that should trigger a sound.
 */
export type SoundEvent =
  | "game-start"
  | "game-pause"
  | "game-exit"
  | "reward"
  | "level-up"
  | "achievement"
  | "result"
  | "quest-claim"
  | "milestone-reached";

export function playSound(_event: SoundEvent) {
  // Intentionally a no-op until real audio assets exist.
}
