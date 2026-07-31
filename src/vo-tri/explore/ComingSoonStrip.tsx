import { comingSoonActivities } from "./activities";
import { ComingSoonCard } from "./ComingSoonCard";

export function ComingSoonStrip() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-vt-display text-lg font-bold text-vt-text-primary">Sắp ra mắt</h2>
        <p className="text-sm text-vt-text-secondary">Đang được xây dựng phía sau hậu trường.</p>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {comingSoonActivities.map((activity) => (
          <div key={activity.id} className="w-64 shrink-0">
            <ComingSoonCard activity={activity} />
          </div>
        ))}
      </div>
    </section>
  );
}
