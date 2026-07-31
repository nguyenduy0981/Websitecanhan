"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { emptyCopy } from "@/vo-tri/copy/microcopy";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { activities, comingSoonActivities, getDailyPicks, getFeaturedActivity } from "./activities";
import { ActivityCard } from "./ActivityCard";
import { ActivityDetailSheet } from "./ActivityDetailSheet";
import { CategoryChips, type ChipValue } from "./CategoryChips";
import { ComingSoonCard } from "./ComingSoonCard";
import { ComingSoonStrip } from "./ComingSoonStrip";
import { ContinuePlaying, type RecentPlay } from "./ContinuePlaying";
import { DailyPicks } from "./DailyPicks";
import { FeaturedActivity } from "./FeaturedActivity";
import type { Activity } from "./types";

// No session/play-history system exists yet — always empty, so
// ContinuePlaying renders nothing (see its own component doc).
const recentPlays: RecentPlay[] = [];

export function ExploreInteractive() {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<ChipValue>("all");
  const [selected, setSelected] = useState<Activity | null>(null);

  const featured = useMemo(() => getFeaturedActivity(), []);
  const picks = useMemo(() => getDailyPicks(3), []);

  const showingComingSoon = chip === "sap-ra-mat";

  const filteredActivities = useMemo(() => {
    if (showingComingSoon) return [];
    const q = query.trim().toLowerCase();
    return activities.filter((a) => {
      const matchesChip = chip === "all" || a.category === chip;
      const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      return matchesChip && matchesQuery;
    });
  }, [chip, query, showingComingSoon]);

  const filteredComingSoon = useMemo(() => {
    if (!showingComingSoon) return [];
    const q = query.trim().toLowerCase();
    if (!q) return comingSoonActivities;
    return comingSoonActivities.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }, [query, showingComingSoon]);

  const isEmpty = showingComingSoon ? filteredComingSoon.length === 0 : filteredActivities.length === 0;

  return (
    <>
      <FeaturedActivity activity={featured} onSelect={setSelected} />

      <DailyPicks picks={picks} onSelect={setSelected} />

      <ContinuePlaying items={recentPlays} onSelect={setSelected} />

      <section id="activity-grid" className="scroll-mt-24 flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-vt-text-secondary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm một trò gì đó..."
            aria-label="Tìm hoạt động"
            className="vt-interactive w-full rounded-vt-md border border-vt-border bg-vt-surface py-2.5 pl-10 pr-4 text-sm text-vt-text-primary placeholder:text-vt-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary"
          />
        </div>

        <CategoryChips active={chip} onChange={setChip} />

        {isEmpty ? (
          <div className="vt-fade-up flex flex-col items-center gap-3 py-12 text-center">
            <Mascot mood="sleepy" size="lg" />
            <p className="font-vt-display text-base font-semibold text-vt-text-primary">{emptyCopy.noResults.title}</p>
            <p className="max-w-sm text-sm text-vt-text-secondary">{emptyCopy.noResults.description}</p>
          </div>
        ) : showingComingSoon ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredComingSoon.map((activity) => (
              <ComingSoonCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onSelect={setSelected} />
            ))}
          </div>
        )}
      </section>

      <ComingSoonStrip />

      <ActivityDetailSheet activity={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}
