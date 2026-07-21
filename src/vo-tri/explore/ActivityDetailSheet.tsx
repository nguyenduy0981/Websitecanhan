"use client";

import { Clock3, RotateCcw, Trophy, Zap } from "lucide-react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetTitle,
} from "@/vo-tri/ui/BottomSheet";
import { Button } from "@/vo-tri/ui/Button";
import { toast } from "@/vo-tri/ui/toast";
import { DIFFICULTY_LABEL, type Activity } from "./types";

export function ActivityDetailSheet({ activity, onOpenChange }: { activity: Activity | null; onOpenChange: (open: boolean) => void }) {
  function handleStart() {
    if (!activity) return;
    if (activity.action === "check-in") {
      toast({ variant: "success", title: "+15 Điểm Vô Tri", description: "Điểm danh hôm nay thành công. Mai quay lại nhé!" });
    } else {
      toast({ variant: "info", title: "Đang hoàn thiện...", description: "Phần chơi thật sắp ra mắt, hẹn bạn quay lại sớm." });
    }
    onOpenChange(false);
  }

  return (
    <BottomSheet open={activity !== null} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        {activity && (
          <>
            <BottomSheetTitle>{activity.name}</BottomSheetTitle>
            <BottomSheetDescription>{activity.description}</BottomSheetDescription>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Stat icon={<Trophy className="h-4 w-4 text-vt-reward" />} label="Phần thưởng" value={`${activity.reward} điểm`} />
              <Stat icon={<Zap className="h-4 w-4 text-vt-xp" />} label="XP" value={`+${activity.xp}`} />
              <Stat icon={<Clock3 className="h-4 w-4 text-vt-text-secondary" />} label="Thời gian" value={`~${activity.estMinutes} phút`} />
              <Stat
                icon={<RotateCcw className="h-4 w-4 text-vt-text-secondary" />}
                label="Độ khó"
                value={DIFFICULTY_LABEL[activity.difficulty]}
              />
            </div>

            {(activity.dailyLimit || activity.cooldownMinutes) && (
              <p className="mt-3 text-xs text-vt-text-secondary">
                {activity.dailyLimit && `Tối đa ${activity.dailyLimit} lần/ngày.`}{" "}
                {activity.cooldownMinutes && `Hồi sau ${activity.cooldownMinutes} phút.`}
              </p>
            )}

            <Button variant="primary" size="lg" className="mt-6 w-full" onClick={handleStart}>
              Bắt đầu
            </Button>
          </>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-vt-md border border-vt-border bg-vt-surface p-2.5">
      {icon}
      <div>
        <p className="text-[11px] text-vt-text-secondary">{label}</p>
        <p className="font-medium text-vt-text-primary">{value}</p>
      </div>
    </div>
  );
}
