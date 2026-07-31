"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";
import { Button } from "@/vo-tri/ui/Button";
import { AnswerTrialDialog } from "./AnswerTrialDialog";
import { CourtTrialList } from "./CourtTrialList";
import { StartTrialSheet } from "./StartTrialSheet";
import type { CourtTrial, Dilemma } from "./types";

/** Composes the real, logged-in Toà Án Vô Tri experience — trials list, "start a trial" entry point, and the blind-answer dialog. */
export function CourtInteractive({
  trials,
  currentUserId,
  dilemma,
}: {
  trials: CourtTrial[];
  currentUserId: string;
  dilemma: Dilemma;
}) {
  const [startOpen, setStartOpen] = useState(false);
  const [answering, setAnswering] = useState<CourtTrial | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-vt-text-secondary">Mỗi phiên xử dùng câu hỏi Vô Tri Đồng Thuận hôm nay.</p>
        <Button variant="primary" size="sm" onClick={() => setStartOpen(true)}>
          <Gavel className="h-4 w-4" aria-hidden />
          Đưa ra Toà
        </Button>
      </div>

      <CourtTrialList trials={trials} currentUserId={currentUserId} onAnswer={setAnswering} />

      <StartTrialSheet dilemma={dilemma} open={startOpen} onOpenChange={setStartOpen} />
      <AnswerTrialDialog trial={answering} open={answering !== null} onOpenChange={(open) => !open && setAnswering(null)} />
    </div>
  );
}
