import { displaySerif } from "./fonts";

// Small, static, free theme catalog (no new infra) — applied to both the
// editor preview and the public viewer via Gift.themeId. Each theme
// pairs a palette (containerClassName/accentClassName) with a default
// ambient effect and a heading font, so picking a theme gives a
// harmonious result out of the box — the effect is still independently
// overridable from the editor's effect picker.
export interface Theme {
  id: string;
  name: string;
  containerClassName: string;
  accentClassName: string;
  /** Suggested pairing — see EFFECTS in src/config/effects.ts. */
  defaultEffectId: string;
  /** Applied to the gift title/heading only; body text stays on the app's default font for legibility. */
  headingFontClassName: string;
}

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Cổ điển",
    containerClassName: "bg-white text-neutral-900",
    accentClassName: "border-neutral-900",
    defaultEffectId: "snow",
    headingFontClassName: "",
  },
  {
    id: "romantic",
    name: "Lãng mạn",
    containerClassName: "bg-gradient-to-b from-rose-100 to-pink-200 text-rose-950",
    accentClassName: "border-rose-600 text-rose-700",
    defaultEffectId: "hearts",
    headingFontClassName: displaySerif.className,
  },
  {
    id: "elegant",
    name: "Sang trọng",
    containerClassName: "bg-neutral-900 text-amber-100",
    accentClassName: "border-amber-400 text-amber-300",
    defaultEffectId: "fireflies",
    headingFontClassName: displaySerif.className,
  },
  {
    id: "playful",
    name: "Vui tươi",
    containerClassName: "bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-100 text-neutral-900",
    accentClassName: "border-sky-600 text-sky-700",
    defaultEffectId: "confetti",
    headingFontClassName: "",
  },
];

export const DEFAULT_THEME_ID = THEMES[0]!.id;

export function getTheme(themeId: string | null | undefined): Theme {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0]!;
}
