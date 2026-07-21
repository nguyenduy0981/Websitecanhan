import { SocialCard } from "./SocialCard";
import type { FeedItem, ReactionCounts } from "./types";
import { ReactionBar } from "./ReactionBar";

function timeAgo(date: Date): string {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}

export function FeedItemCard({
  item,
  reactionCounts,
  activeReactionId,
  onReact,
}: {
  item: FeedItem;
  reactionCounts?: ReactionCounts;
  activeReactionId?: string;
  onReact?: (reactionId: string) => void;
}) {
  return (
    <SocialCard state={item.cardState}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-vt-full bg-vt-surface text-sm font-semibold text-vt-text-primary">
          {item.actor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.actor.avatarUrl} alt={item.actor.name} className="h-full w-full object-cover" />
          ) : (
            item.actor.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-vt-text-primary">
            <span className="font-semibold">{item.actor.name}</span> {item.text}
          </p>
          <p className="mt-0.5 text-xs text-vt-text-secondary">{timeAgo(item.createdAt)}</p>
        </div>
      </div>
      {onReact && (
        <div className="mt-3">
          <ReactionBar counts={reactionCounts} activeReactionId={activeReactionId} onReact={onReact} />
        </div>
      )}
    </SocialCard>
  );
}
