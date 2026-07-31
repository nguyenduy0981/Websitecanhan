/** Rank ladder is a game-design rule (like Explore's difficulty labels), not per-user data — safe to hardcode. */
const RANKS: { minLevel: number; label: string }[] = [
  { minLevel: 20, label: "Huyền Thoại Vô Tri" },
  { minLevel: 10, label: "Cao Thủ" },
  { minLevel: 5, label: "Kỳ Cựu" },
  { minLevel: 1, label: "Tân Binh" },
];

export function getRank(level: number): string {
  return RANKS.find((r) => level >= r.minLevel)?.label ?? RANKS[RANKS.length - 1]!.label;
}
