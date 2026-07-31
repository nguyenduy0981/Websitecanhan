"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Scale } from "lucide-react";
import { errorCopy } from "@/vo-tri/copy/microcopy";
import { cn } from "@/vo-tri/lib/cn";
import { voteDilemmaAction } from "@/vo-tri/server/actions/court-actions";
import { LoginButton } from "@/vo-tri/shell/LoginButton";
import { Button } from "@/vo-tri/ui/Button";
import { Card, CardContent } from "@/vo-tri/ui/Card";
import { ProgressBar } from "@/vo-tri/ui/ProgressBar";
import { toast } from "@/vo-tri/ui/toast";
import type { ConsensusResult, Dilemma, DilemmaChoice } from "./types";

/**
 * Vô Tri Đồng Thuận's Home widget. `consensus` is `null` for a logged-out
 * visitor (the honest "log in to participate" branch, same pattern as
 * QuestCard's "Đăng nhập để theo dõi tiến độ" state) — the dilemma prompt
 * itself is safe catalog content (like Explore's Daily Picks), so it still
 * renders, just without vote buttons or the real aggregate.
 *
 * A successful vote calls `router.refresh()` rather than optimistically
 * bumping the local count — the whole point of this widget is a REAL
 * aggregate, and only the server (via record-then-recompute) actually
 * knows the true post-vote split.
 */
export function ConsensusCard({ dilemma, consensus }: { dilemma: Dilemma; consensus: ConsensusResult | null }) {
  const router = useRouter();
  const [voting, setVoting] = useState<DilemmaChoice | null>(null);

  const hasVoted = !!consensus?.myChoice;
  const total = (consensus?.choiceACount ?? 0) + (consensus?.choiceBCount ?? 0);
  const percentA = total > 0 ? Math.round(((consensus?.choiceACount ?? 0) / total) * 100) : 0;
  const percentB = total > 0 ? 100 - percentA : 0;

  async function handleVote(choice: DilemmaChoice) {
    setVoting(choice);

    let result;
    try {
      result = await voteDilemmaAction(dilemma.id, choice);
    } catch {
      setVoting(null);
      toast({ variant: "danger", ...errorCopy.generic });
      return;
    }
    setVoting(null);

    if (!result.ok) {
      toast({ variant: "danger", title: result.error.title, description: result.error.description });
      return;
    }
    toast({ variant: "success", title: `+${result.data.points} điểm`, description: "Cảm ơn đã đồng thuận (hoặc không) hôm nay." });
    router.refresh();
  }

  return (
    <Card variant="elevated" padding="md">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-vt-md bg-vt-secondary/15 text-vt-secondary">
            <Scale className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div>
            <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Vô Tri Đồng Thuận</p>
            <p className="text-xs text-vt-text-secondary">Chọn phe hôm nay, xem cả cộng đồng nghiêng về đâu.</p>
          </div>
        </div>

        <p className="text-sm text-vt-text-primary">{dilemma.prompt}</p>

        {!consensus ? (
          <div className="flex flex-col items-start gap-2 rounded-vt-md border border-dashed border-vt-border px-3 py-2">
            <p className="text-xs text-vt-text-secondary">Đăng nhập để tham gia bình chọn.</p>
            <LoginButton size="sm" />
          </div>
        ) : hasVoted ? (
          <div className="flex flex-col gap-3">
            <ConsensusOption label={dilemma.optionA} percent={percentA} active={consensus.myChoice === "a"} />
            <ConsensusOption label={dilemma.optionB} percent={percentB} active={consensus.myChoice === "b"} />
            <p className="text-xs text-vt-text-secondary">{total} người đã chọn hôm nay.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button variant="outline" disabled={voting !== null} onClick={() => handleVote("a")}>
              {dilemma.optionA}
            </Button>
            <Button variant="outline" disabled={voting !== null} onClick={() => handleVote("b")}>
              {dilemma.optionB}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConsensusOption({ label, percent, active }: { label: string; percent: number; active: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", active ? "text-vt-secondary" : "text-vt-text-secondary")}>
          {label}
          {active && " (bạn)"}
        </span>
        <span className="text-vt-text-secondary">{percent}%</span>
      </div>
      <ProgressBar percent={percent} />
    </div>
  );
}
