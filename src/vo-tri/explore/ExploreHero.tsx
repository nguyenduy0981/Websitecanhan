import { Mascot } from "@/vo-tri/ui/Mascot";
import { Button } from "@/vo-tri/ui/Button";

/** Deliberately smaller than Home's hero — Explore's hero is a doorway into the grid below, not the main event. */
export function ExploreHero() {
  return (
    <div className="vt-fade-up flex flex-col items-center gap-5 rounded-vt-xl border border-vt-border bg-vt-card px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <div className="flex flex-col items-center gap-3 sm:items-start">
        <h1 className="font-vt-display text-2xl font-extrabold text-vt-text-primary sm:text-3xl">Khám Phá</h1>
        <p className="max-w-sm text-sm text-vt-text-secondary">
          Một góc nhỏ toàn trò vô nghĩa nhưng vui. Chọn đại một cái, xem chuyện gì xảy ra.
        </p>
        <Button asChild size="sm" variant="primary">
          <a href="#activity-grid">Chọn liều một cái</a>
        </Button>
      </div>
      <Mascot mood="laughing" size="lg" className="shrink-0" />
    </div>
  );
}
