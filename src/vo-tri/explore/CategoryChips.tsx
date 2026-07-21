import { cn } from "@/vo-tri/lib/cn";
import { CATEGORY_LABEL } from "./types";

export type ChipValue = "all" | keyof typeof CATEGORY_LABEL | "sap-ra-mat";

const CHIPS: { value: ChipValue; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "may-man", label: CATEGORY_LABEL["may-man"] },
  { value: "thu-thach", label: CATEGORY_LABEL["thu-thach"] },
  { value: "giai-tri", label: CATEGORY_LABEL["giai-tri"] },
  { value: "nhanh", label: CATEGORY_LABEL.nhanh },
  { value: "sap-ra-mat", label: "Sắp ra mắt" },
];

/**
 * Plain <button>s in normal document order rather than a hand-rolled
 * ARIA `tablist` with roving tabindex: Tab/Enter/Space already work
 * correctly for free this way, and these chips aren't a strict
 * single-panel "tabs" relationship (grid content just re-filters) — the
 * more elaborate pattern would add real complexity for no accessibility
 * gain here.
 */
export function CategoryChips({ active, onChange }: { active: ChipValue; onChange: (value: ChipValue) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo thể loại">
      {CHIPS.map((chip) => {
        const isActive = chip.value === active;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(chip.value)}
            className={cn(
              "vt-interactive rounded-vt-full border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg",
              isActive
                ? "border-transparent bg-vt-primary text-vt-on-accent shadow-vt-glow-primary"
                : "border-vt-border bg-vt-surface text-vt-text-secondary hover:border-vt-primary/50 hover:text-vt-text-primary",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
