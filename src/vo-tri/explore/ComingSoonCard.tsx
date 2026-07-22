import { Lock } from "lucide-react";
import { notReadyCopy } from "@/vo-tri/copy/microcopy";
import { toast } from "@/vo-tri/ui/toast";
import type { ComingSoonActivity } from "./types";

/** No fake release date anywhere — the honesty is the point, not a countdown that would just be made up. */
export function ComingSoonCard({ activity }: { activity: ComingSoonActivity }) {
  const Icon = activity.icon;

  return (
    <button
      type="button"
      onClick={() => toast({ variant: "info", ...notReadyCopy.comingSoon })}
      className="vt-interactive group relative flex w-full flex-col gap-3 overflow-hidden rounded-vt-lg border border-dashed border-vt-border bg-vt-surface/60 p-4 text-left"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-vt-md bg-vt-vip/15 text-vt-vip">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-1 rounded-vt-full bg-vt-vip/15 px-2 py-0.5 text-[11px] font-medium text-vt-vip">
          <Lock className="h-3 w-3" /> Đang phát triển
        </span>
      </div>
      <div>
        <h3 className="font-vt-display text-sm font-semibold text-vt-text-primary">{activity.name}</h3>
        <p className="mt-0.5 text-xs text-vt-text-secondary">{activity.description}</p>
      </div>
    </button>
  );
}
