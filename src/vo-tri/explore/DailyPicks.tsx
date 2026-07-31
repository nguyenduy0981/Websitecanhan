import { ActivityCard } from "./ActivityCard";
import type { Activity } from "./types";

export function DailyPicks({ picks, onSelect }: { picks: Activity[]; onSelect: (activity: Activity) => void }) {
  if (picks.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Gợi ý hôm nay</h2>
        <p className="text-sm text-vt-text-secondary">Vài lựa chọn được chọn riêng cho hôm nay.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {picks.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
