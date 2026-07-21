"use client";

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetTitle,
} from "@/vo-tri/ui/BottomSheet";
import { Button } from "@/vo-tri/ui/Button";
import { toast } from "@/vo-tri/ui/toast";
import { ActivityStatGrid } from "./ActivityStatGrid";
import type { Activity } from "./types";

export function ActivityDetailSheet({ activity, onOpenChange }: { activity: Activity | null; onOpenChange: (open: boolean) => void }) {
  function handleStart() {
    if (!activity) return;
    if (activity.action === "check-in") {
      toast({ variant: "success", title: "+15 Điểm Vô Tri", description: "Điểm danh hôm nay thành công. Mai quay lại nhé!" });
      onOpenChange(false);
    }
    // Every other activity now has a real pre-game/gameplay-framework
    // route to go to — see src/app/play/[activityId]/page.tsx — so the
    // sheet just links there instead of showing a placeholder toast.
  }

  return (
    <BottomSheet open={activity !== null} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        {activity && (
          <>
            <BottomSheetTitle>{activity.name}</BottomSheetTitle>
            <BottomSheetDescription>{activity.description}</BottomSheetDescription>

            <div className="mt-4">
              <ActivityStatGrid activity={activity} />
            </div>

            {(activity.dailyLimit || activity.cooldownMinutes) && (
              <p className="mt-3 text-xs text-vt-text-secondary">
                {activity.dailyLimit && `Tối đa ${activity.dailyLimit} lần/ngày.`}{" "}
                {activity.cooldownMinutes && `Hồi sau ${activity.cooldownMinutes} phút.`}
              </p>
            )}

            {activity.action === "check-in" ? (
              <Button variant="primary" size="lg" className="mt-6 w-full" onClick={handleStart}>
                Bắt đầu
              </Button>
            ) : (
              <Button asChild variant="primary" size="lg" className="mt-6 w-full">
                <a href={`/play/${activity.id}`}>Bắt đầu</a>
              </Button>
            )}
          </>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
