import { cn } from "@/vo-tri/lib/cn";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Generic chip filter, extracted from Explore's category chips so
 * Leaderboard's scope filter (and any future chip filter) shares one
 * implementation instead of a copy-pasted variant. Plain <button>s in
 * normal document order rather than a hand-rolled ARIA `tablist` with
 * roving tabindex: Tab/Enter/Space already work correctly for free this
 * way, and chip filters here just re-filter content rather than being a
 * strict single-panel "tabs" relationship — the more elaborate pattern
 * would add real complexity for no accessibility gain.
 */
export function ChipGroup<T extends string>({
  options,
  active,
  onChange,
  ariaLabel,
}: {
  options: ChipOption<T>[];
  active: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((chip) => {
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
