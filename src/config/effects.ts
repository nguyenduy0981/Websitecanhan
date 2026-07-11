// Small, static, free effect catalog (no new infra) — applied to the
// public viewer via Gift.effectId. Rendered by a canvas + requestAnimationFrame
// engine (src/app/g/[slug]/effect-engine.ts) that's fully skipped under
// prefers-reduced-motion and only starts once the gift is actually opened.
export interface Effect {
  id: string;
  name: string;
}

export const EFFECTS: Effect[] = [
  { id: "none", name: "Không có" },
  { id: "hearts", name: "Trái tim bay" },
  { id: "confetti", name: "Confetti" },
  { id: "snow", name: "Tuyết rơi" },
  { id: "petals", name: "Cánh hoa rơi" },
  { id: "fireflies", name: "Đom đóm lấp lánh" },
  { id: "bubbles", name: "Bong bóng" },
];

export const DEFAULT_EFFECT_ID = "none";

export function isKnownEffect(effectId: string | null | undefined): effectId is string {
  return EFFECTS.some((effect) => effect.id === effectId);
}
