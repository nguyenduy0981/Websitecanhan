import { ActivityStatGrid } from "@/vo-tri/explore/ActivityStatGrid";
import type { Activity } from "@/vo-tri/explore/types";
import { Button } from "@/vo-tri/ui/Button";
import { Mascot } from "@/vo-tri/ui/Mascot";

/**
 * Every future Activity's "about to play" moment looks like this —
 * name/description/difficulty/time/reward/entry-conditions, one CTA.
 * Reuses Explore's ActivityStatGrid so the facts shown here and in the
 * Explore preview sheet never drift apart.
 */
export function PreGameScreen({ activity, onStart }: { activity: Activity; onStart: () => void }) {
  return (
    <div className="vt-fade-up mx-auto flex max-w-md flex-col items-center gap-5 py-10 text-center">
      <Mascot mood="happy" size="xl" />
      <div>
        <h1 className="font-vt-display text-2xl font-extrabold text-vt-text-primary">{activity.name}</h1>
        <p className="mt-2 text-sm text-vt-text-secondary">{activity.description}</p>
      </div>

      <div className="w-full">
        <ActivityStatGrid activity={activity} />
      </div>

      {(activity.dailyLimit || activity.cooldownMinutes) && (
        <p className="text-xs text-vt-text-secondary">
          {activity.dailyLimit && `Tối đa ${activity.dailyLimit} lần/ngày.`}{" "}
          {activity.cooldownMinutes && `Hồi sau ${activity.cooldownMinutes} phút.`}
        </p>
      )}

      <Button variant="primary" size="lg" className="w-full" onClick={onStart}>
        Bắt đầu
      </Button>
    </div>
  );
}
