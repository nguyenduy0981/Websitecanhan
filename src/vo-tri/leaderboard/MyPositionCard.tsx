import { ArrowUp } from "lucide-react";
import type { MyPosition } from "./types";

/**
 * `position: fixed` (not `sticky`) on purpose: the list this floats over
 * can grow to thousands of rows, and a sticky card only stays put within
 * its own containing block — it would scroll away long before the user
 * reaches the bottom of a huge list. Fixed to the viewport keeps "your
 * rank" visible no matter how far down you've scrolled. Offset accounts
 * for the mobile BottomNav pill and the desktop Sidebar's width so it
 * stays centered over the actual content column, not the full viewport.
 * Only meaningful once you actually have a rank, so the caller simply
 * doesn't render this when `myPosition` is undefined (graceful, not a
 * placeholder card).
 */
export function MyPositionCard({ myPosition }: { myPosition: MyPosition }) {
  return (
    <div className="fixed bottom-24 left-1/2 z-30 flex w-fit -translate-x-1/2 items-center gap-4 rounded-vt-full border border-vt-glass-border bg-vt-glass px-5 py-3 shadow-vt-4 backdrop-blur-vt-md md:bottom-6 md:left-[calc(50%+7.5rem)]">
      <div className="text-center">
        <p className="font-vt-display text-lg font-extrabold text-vt-primary">#{myPosition.rank}</p>
        <p className="text-[10px] text-vt-text-secondary">Hạng của bạn</p>
      </div>
      <div className="h-8 w-px bg-vt-divider" />
      <div className="text-center">
        <p className="font-vt-display text-lg font-extrabold text-vt-text-primary">{myPosition.points.toLocaleString("vi-VN")}</p>
        <p className="text-[10px] text-vt-text-secondary">Điểm</p>
      </div>
      {myPosition.gapToNext > 0 && (
        <>
          <div className="h-8 w-px bg-vt-divider" />
          <div className="flex items-center gap-1 text-xs text-vt-text-secondary">
            <ArrowUp className="h-3.5 w-3.5 text-vt-success" />
            Cách {myPosition.gapToNext.toLocaleString("vi-VN")} điểm nữa
          </div>
        </>
      )}
    </div>
  );
}
