import type { Metadata } from "next";

// The page itself is "use client" (interactive component demos), which
// can't export `metadata` — this co-located server layout is the only way
// to actually enforce the noindex CLAUDE.md has documented for this route
// all along. Real bug found in the platform audit: nothing was enforcing
// it before this file existed.
export const metadata: Metadata = {
  title: "VÔ TRI Style Guide",
  robots: { index: false, follow: false },
};

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
