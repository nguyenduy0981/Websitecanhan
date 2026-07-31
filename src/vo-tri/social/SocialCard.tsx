import { Bookmark, Pin, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/vo-tri/lib/cn";
import { Badge } from "@/vo-tri/ui/Badge";
import { Card } from "@/vo-tri/ui/Card";
import type { SocialCardState } from "./types";

/**
 * The one card shape every piece of user-generated content in VÔ TRI
 * renders inside — an activity share, a comment thread's parent post,
 * a feed item — so "normal/featured/pinned/saved" always look the same
 * regardless of what content type is inside.
 */
export function SocialCard({
  state = "normal",
  children,
  className,
}: {
  state?: SocialCardState;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      variant={state === "featured" ? "elevated" : "default"}
      className={cn(
        "relative",
        state === "featured" && "border-vt-primary/50 shadow-vt-glow-primary",
        state === "pinned" && "border-vt-secondary/40",
        className,
      )}
    >
      {state === "featured" && (
        <Badge variant="secondary" className="absolute -top-3 left-4">
          <Sparkles className="h-3 w-3" /> Nổi bật
        </Badge>
      )}
      {state === "pinned" && (
        <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-vt-full bg-vt-secondary/15 text-vt-secondary" title="Đã ghim">
          <Pin className="h-3.5 w-3.5" />
        </span>
      )}
      {state === "saved" && (
        <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-vt-full bg-vt-reward/15 text-vt-reward" title="Đã lưu">
          <Bookmark className="h-3.5 w-3.5 fill-current" />
        </span>
      )}
      {children}
    </Card>
  );
}
