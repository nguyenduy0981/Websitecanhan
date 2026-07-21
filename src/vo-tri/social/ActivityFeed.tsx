import { Mascot } from "@/vo-tri/ui/Mascot";
import { FeedItemCard } from "./FeedItemCard";
import type { FeedItem } from "./types";

/** No fake activity — this always renders the honest empty state until a real backend produces real feed items ("Không dùng dữ liệu giả"). */
export function ActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-vt-lg border border-vt-border bg-vt-card py-14 text-center">
        <Mascot mood="sleepy" size="lg" />
        <div>
          <p className="font-vt-display text-base font-semibold text-vt-text-primary">Chưa có gì để xem ở đây</p>
          <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">Khi có người làm gì đó thú vị, nó sẽ hiện lên đây đầu tiên.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
