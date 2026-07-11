// Small, static, free effect catalog (no new infra) — applied to the
// public viewer via Gift.effectId. Purely decorative CSS animation;
// respects prefers-reduced-motion via the global override in globals.css.
export interface Effect {
  id: string;
  name: string;
}

export const EFFECTS: Effect[] = [
  { id: "none", name: "Không có" },
  { id: "confetti", name: "Confetti" },
  { id: "hearts", name: "Trái tim bay" },
];

export const DEFAULT_EFFECT_ID = "none";

export function isKnownEffect(effectId: string | null | undefined): effectId is string {
  return EFFECTS.some((effect) => effect.id === effectId);
}
