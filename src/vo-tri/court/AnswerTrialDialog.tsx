"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorCopy } from "@/vo-tri/copy/microcopy";
import { submitCourtAnswerAction } from "@/vo-tri/server/actions/court-actions";
import { Button } from "@/vo-tri/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/vo-tri/ui/Dialog";
import { toast } from "@/vo-tri/ui/toast";
import type { CourtTrial, DilemmaChoice } from "./types";

/** The blind-answer flow — picking an option locks it in immediately (no draft/edit step), matching the real server-side rule: `submit_court_answer` accepts exactly one answer per party, ever. */
export function AnswerTrialDialog({
  trial,
  open,
  onOpenChange,
}: {
  trial: CourtTrial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [answering, setAnswering] = useState<DilemmaChoice | null>(null);

  async function handleAnswer(choice: DilemmaChoice) {
    if (!trial) return;
    setAnswering(choice);

    let result;
    try {
      result = await submitCourtAnswerAction(trial.id, choice);
    } catch {
      setAnswering(null);
      toast({ variant: "danger", ...errorCopy.generic });
      return;
    }
    setAnswering(null);
    onOpenChange(false);

    if (!result.ok) {
      toast({ variant: "danger", title: result.error.title, description: result.error.description });
      return;
    }

    toast(
      result.data.status === "resolved"
        ? { variant: "success", title: "Toà đã tuyên án!", description: "Xem kết quả trong danh sách phiên xử." }
        : { variant: "default", title: "Đã trả lời", description: "Chờ bên còn lại trả lời để Toà tuyên án." },
    );
    router.refresh();
  }

  if (!trial) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trả lời trước Toà</DialogTitle>
          <DialogDescription>Chọn xong là chốt luôn, không đổi ý được đâu.</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-vt-text-primary">{trial.dilemma.prompt}</p>

        <div className="flex flex-col gap-2">
          <Button variant="outline" disabled={answering !== null} onClick={() => handleAnswer("a")}>
            {trial.dilemma.optionA}
          </Button>
          <Button variant="outline" disabled={answering !== null} onClick={() => handleAnswer("b")}>
            {trial.dilemma.optionB}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Để sau
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
