"use client";

import { useState } from "react";
import { LeaderboardHero } from "./LeaderboardHero";
import { LeaderboardList } from "./LeaderboardList";
import { ScopeFilter } from "./ScopeFilter";
import type { LeaderboardScope } from "./types";

// No backend/session yet — every scope shows the same honest "no one has
// played yet" state today. The filter is fully real/interactive (it's
// the architecture this prompt asks for); only the data behind it is
// missing. Swap this constant for a real fetch keyed on `scope` once a
// backend exists — LeaderboardList/TopThreePodium/MyPositionCard already
// accept real prop shapes and need no changes.
const players: never[] = [];

export function LeaderboardInteractive() {
  const [scope, setScope] = useState<LeaderboardScope>("global");

  return (
    <>
      <LeaderboardHero />
      <ScopeFilter active={scope} onChange={setScope} />
      <LeaderboardList players={players} />
    </>
  );
}
