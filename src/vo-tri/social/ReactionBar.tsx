"use client";

import { cn } from "@/vo-tri/lib/cn";
import { REACTION_KINDS } from "./reactions";
import type { ReactionCounts, ReactionKind } from "./types";

/**
 * Extensible by construction: the set of reactions is a prop
 * (`kinds`, defaulting to `REACTION_KINDS`), not hardcoded into this
 * component — adding a 6th reaction later is a one-line change to
 * `reactions.ts`, not a rewrite here.
 */
export function ReactionBar({
  kinds = REACTION_KINDS,
  counts = {},
  activeReactionId,
  onReact,
}: {
  kinds?: ReactionKind[];
  counts?: ReactionCounts;
  activeReactionId?: string;
  onReact: (reactionId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Bày tỏ cảm xúc">
      {kinds.map((kind) => {
        const active = kind.id === activeReactionId;
        const count = counts[kind.id] ?? 0;
        return (
          <button
            key={kind.id}
            type="button"
            aria-pressed={active}
            aria-label={kind.label}
            onClick={() => onReact(kind.id)}
            className={cn(
              "vt-interactive flex items-center gap-1.5 rounded-vt-full border px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vt-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vt-bg",
              active
                ? "border-transparent bg-vt-primary text-vt-on-accent"
                : "border-vt-border bg-vt-surface text-vt-text-secondary hover:border-vt-primary/50 hover:text-vt-text-primary",
            )}
          >
            <kind.icon className={cn("h-3.5 w-3.5", active && "vt-wiggle")} />
            {kind.label}
            {count > 0 && <span className={active ? "text-vt-on-accent" : "text-vt-text-secondary"}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
