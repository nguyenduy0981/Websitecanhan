"use client";

import { useEffect, useState } from "react";

/** SSR-safe: starts false, syncs to the real value on mount (avoids a hydration mismatch since the server can't know viewport size). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
