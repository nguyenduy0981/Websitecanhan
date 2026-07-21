import { ActivityCard } from "./ActivityCard";
import type { Activity } from "./types";

export interface RecentPlay {
  activity: Activity;
  lastPlayedAt: Date;
}

/**
 * Renders nothing when there's no real play history — no session system
 * exists yet, so every call site today passes `items={[]}` and this
 * section simply never appears (not a placeholder, not hidden via CSS).
 * Ready to receive real history the moment a backend exists.
 */
export function ContinuePlaying({ items, onSelect }: { items: RecentPlay[]; onSelect: (activity: Activity) => void }) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Tiếp tục chơi</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ activity }) => (
          <ActivityCard key={activity.id} activity={activity} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
