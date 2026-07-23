"use client";

import { useRouter } from "next/navigation";
import { activities } from "@/vo-tri/explore/activities";
import { GameFrame } from "@/vo-tri/game";
import { Button } from "@/vo-tri/ui/Button";
import { Mascot } from "@/vo-tri/ui/Mascot";

/**
 * Honest placeholder gameplay body — this route is real (real Activity
 * data, real Engine), but no minigame exists yet for any Activity, so
 * this says so instead of pretending. The "Hoàn thành" outcome only ever
 * uses the Activity's own real reward/xp — never coins/level-up/
 * achievement extras, since nothing real computed those for this
 * session. The full rich result (with those extras, plus win/lose/
 * timeout/countdown) is demonstrated with fixture data on
 * /vo-tri-styleguide instead, same convention as every other framework/
 * system in this codebase. `comboEnabled` is turned on here (the one
 * real Engine rule this route opts into) so the combo counter + scoring
 * multiplier are provably real end-to-end, not just a styleguide fixture.
 * Deliberately no `countdownSeconds` here — it would visually cover this
 * demo's own action buttons with the countdown overlay, breaking the
 * "Hoàn thành"/"Thoát" clicks tests/e2e/play-flow.spec.ts already relies on.
 */
export function PlayClient({ activityId }: { activityId: string }) {
  const router = useRouter();
  // Looked up client-side (not passed as a server→client prop) because
  // Activity carries a `LucideIcon` component reference, which the RSC
  // boundary can't serialize — a real bug caught by `next build`, not
  // just typecheck. See src/app/play/[activityId]/page.tsx.
  const activity = activities.find((a) => a.id === activityId)!;

  return (
    <GameFrame activity={activity} rules={{ comboEnabled: true }} onExit={() => router.push("/explore")}>
      {(ctx) => (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Mascot mood="thinking" size="lg" />
          <div>
            <p className="font-vt-display text-sm font-semibold text-vt-text-primary">Gameplay thật đang được lắp ráp</p>
            <p className="mt-1 max-w-xs text-sm text-vt-text-secondary">
              Đây là khung chơi của {activity.name} — phần luật chơi thật sẽ nối vào đây ở một prompt sau.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              ctx.registerHit();
              ctx.addScore(10);
              ctx.setProgress(Math.min(100, ctx.progress + 10));
            }}
          >
            Thử cộng điểm + combo (demo Engine)
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => ctx.lose({ points: ctx.score, xp: Math.round(activity.xp / 2) })}>
              Thử thua (demo)
            </Button>
            <Button variant="primary" onClick={() => ctx.complete({ points: activity.reward, xp: activity.xp })}>
              Hoàn thành
            </Button>
          </div>
        </div>
      )}
    </GameFrame>
  );
}
