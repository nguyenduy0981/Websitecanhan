// Small, static, free theme catalog (no new infra) — applied to both the
// editor preview and the public viewer via Gift.themeId.
export interface Theme {
  id: string;
  name: string;
  containerClassName: string;
  accentClassName: string;
}

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Cổ điển",
    containerClassName: "bg-white text-neutral-900",
    accentClassName: "border-neutral-900",
  },
  {
    id: "romantic",
    name: "Lãng mạn",
    containerClassName: "bg-gradient-to-b from-rose-100 to-pink-200 text-rose-950",
    accentClassName: "border-rose-600 text-rose-700",
  },
  {
    id: "elegant",
    name: "Sang trọng",
    containerClassName: "bg-neutral-900 text-amber-100",
    accentClassName: "border-amber-400 text-amber-300",
  },
  {
    id: "playful",
    name: "Vui tươi",
    containerClassName: "bg-gradient-to-br from-yellow-100 via-pink-100 to-sky-100 text-neutral-900",
    accentClassName: "border-sky-600 text-sky-700",
  },
];

export const DEFAULT_THEME_ID = THEMES[0]!.id;

export function getTheme(themeId: string | null | undefined): Theme {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0]!;
}
