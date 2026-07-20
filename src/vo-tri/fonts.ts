import { Be_Vietnam_Pro, Unbounded } from "next/font/google";

// Self-hosted by Next at build time (next/font) — no extra runtime network
// request. Both subsets include "vietnamese" since VÔ TRI's
// content is Vietnamese-first and diacritics must render correctly
// everywhere, not just in Latin-only test copy.
//
// Display: Unbounded — bold geometric letterforms with real personality.
// Deliberately NOT Inter/Poppins/Montserrat-family (the fonts every
// generic "AI SaaS" template reaches for by default) and NOT a rounded
// bubble font like Baloo (reads as a kids' app, which the brand explicitly
// rejects). Used for headings, mascot speech, and moments that should feel
// loud/playful — never for body copy.
export const displayFont = Unbounded({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--vt-font-display",
  display: "swap",
});

// Body: Be Vietnam Pro — designed for Vietnamese diacritics specifically
// (not a Latin font with a bolted-on Vietnamese subset), with enough
// geometric character to still feel distinct at small sizes, so long
// stretches of reading (gift messages, comments, chat) stay comfortable.
export const bodyFont = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--vt-font-body",
  display: "swap",
});

export const voTriFontVariables = `${displayFont.variable} ${bodyFont.variable}`;
