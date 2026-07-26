"use client";

import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/vo-tri/ui/Dialog";
import { Button } from "@/vo-tri/ui/Button";
import { LevelUpBanner } from "@/vo-tri/ui/LevelUpBanner";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { RewardReveal } from "@/vo-tri/ui/RewardReveal";
import { playSound } from "@/vo-tri/lib/sound";
import { milestones } from "./milestones";
import { MilestoneBanner } from "./MilestoneBanner";
import type { ClaimResult, QuestDefinition } from "./types";

/**
 * The Reward Claim + Celebration Experience: one Dialog composing the
 * same celebration primitives ResultScreen uses for gameplay completion
 * (RewardReveal, LevelUpBanner) plus the retention-specific
 * MilestoneBanner — so claiming a quest/goal feels like the same family
 * of moment as finishing an Activity, not a second unrelated pattern.
 */
export function ClaimRewardDialog({
  open,
  onOpenChange,
  quest,
  result,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quest: QuestDefinition;
  result: ClaimResult;
}) {
  const played = useRef(false);
  useEffect(() => {
    if (!open || played.current) return;
    played.current = true;
    playSound("quest-claim");
  }, [open]);

  // ClaimResult.milestoneReached only carries an id (see types.ts) —
  // look up the real definition (icon included) from the catalog here,
  // client-side, instead of the Server Action ever returning it directly.
  const milestoneDef = result.milestoneReached ? milestones.find((m) => m.id === result.milestoneReached!.id) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader className="items-center text-center">
          <Mascot mood="celebrating" size="lg" />
          <DialogTitle>Đã hoàn thành!</DialogTitle>
          <p className="text-sm text-vt-text-secondary">{quest.title}</p>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <RewardReveal points={result.points} xp={result.xp} />
          {result.leveledUp && <LevelUpBanner newLevel={result.leveledUp.newLevel} />}
          {milestoneDef && <MilestoneBanner milestone={milestoneDef} />}
        </div>

        <DialogFooter className="justify-center">
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Ngon, cất vào túi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
