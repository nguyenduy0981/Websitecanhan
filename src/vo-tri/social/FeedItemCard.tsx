import { timeAgo } from "@/vo-tri/lib/time";
import { Avatar } from "@/vo-tri/ui/Avatar";
import { SocialCard } from "./SocialCard";
import type { FeedItem, ReactionCounts } from "./types";
import { ReactionBar } from "./ReactionBar";

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
        <Avatar name={item.actor.name} avatarUrl={item.actor.avatarUrl} />
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
