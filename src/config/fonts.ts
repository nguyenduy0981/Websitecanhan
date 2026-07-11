import { Playfair_Display } from "next/font/google";

// Self-hosted by Next at build time (next/font) — no extra runtime
// network request, no new npm dependency. Vietnamese subset included so
// diacritics render correctly. Used for the "romantic"/"elegant" theme
// headings to give them a distinct, premium feel from the default UI font.
export const displaySerif = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700"],
  display: "swap",
});
