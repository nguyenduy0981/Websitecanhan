import Link from "next/link";
import { Button } from "@/vo-tri/ui/Button";
import { Mascot } from "@/vo-tri/ui/Mascot";

/** For an Activity that exists in the catalog but has no gameplay wired up yet — a real, specific state ("this one, not ready"), not a generic "Coming Soon" label. */
export function GameNotReadyState({ activityName }: { activityName: string }) {
  return (
    <div className="vt-fade-up mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
      <Mascot mood="thinking" size="lg" />
      <div>
        <p className="font-vt-display text-base font-semibold text-vt-text-primary">{activityName} đang được lắp ráp</p>
        <p className="mt-1 text-sm text-vt-text-secondary">Phần chơi thật chưa xong — ghé Khám Phá thử trò khác trong lúc chờ nhé.</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/explore">Về Khám Phá</Link>
      </Button>
    </div>
  );
}
