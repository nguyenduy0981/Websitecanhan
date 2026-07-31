import { Play, X } from "lucide-react";
import { Button } from "@/vo-tri/ui/Button";
import { Mascot } from "@/vo-tri/ui/Mascot";

export function PausedOverlay({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
  return (
    <div className="vt-pop-in absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-vt-xl bg-vt-bg/85 text-center backdrop-blur-vt-sm">
      <Mascot mood="sleepy" size="lg" />
      <p className="font-vt-display text-lg font-semibold text-vt-text-primary">Đã tạm dừng</p>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onExit}>
          <X className="h-4 w-4" /> Thoát
        </Button>
        <Button variant="primary" onClick={onResume}>
          <Play className="h-4 w-4" /> Tiếp tục
        </Button>
      </div>
    </div>
  );
}
