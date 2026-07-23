"use client";

import { Link2, MessageCircle, Send, Share2 } from "lucide-react";
import { Button } from "@/vo-tri/ui/Button";
import { Card } from "@/vo-tri/ui/Card";
import { toast } from "@/vo-tri/ui/toast";

// lucide-react has no brand/logo icons (Facebook/X etc. were dropped
// upstream) — generic share-shaped icons here are arguably more honest
// anyway, since these buttons aren't real integrations yet either.
const INERT_CHANNELS = [
  { icon: Share2, label: "Facebook" },
  { icon: Send, label: "X" },
  { icon: MessageCircle, label: "Zalo" },
];

/**
 * The one share experience for any shareable thing in VÔ TRI (a profile,
 * an activity, a feed post later). Copy-link is real and works today
 * (Clipboard API, no backend needed); social-platform buttons are
 * visibly present but inert — "chuẩn bị để sau này dễ mở rộng," an
 * honest "not built yet," not a fake integration.
 */
export function ShareSheet({ title, description, url }: { title: string; description: string; url: string }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      toast({ variant: "success", title: "Đã sao chép!", description: "Link đã nằm trong clipboard rồi đó." });
    } catch {
      toast({ variant: "danger", title: "Toang rồi...", description: "Trình duyệt không cho sao chép. Copy tay vậy." });
    }
  }

  return (
    <Card variant="default" className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="font-vt-display text-sm font-semibold text-vt-text-primary">{title}</p>
        <p className="text-sm text-vt-text-secondary">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {INERT_CHANNELS.map((c) => (
          <button
            key={c.label}
            type="button"
            disabled
            title={`${c.label} — sắp có`}
            aria-label={`Chia sẻ qua ${c.label} — sắp có`}
            className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-vt-full border border-vt-border text-vt-text-secondary opacity-40"
          >
            <c.icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
        <Button variant="outline" onClick={handleCopy}>
          <Link2 className="h-4 w-4" /> Sao chép link
        </Button>
      </div>
    </Card>
  );
}
