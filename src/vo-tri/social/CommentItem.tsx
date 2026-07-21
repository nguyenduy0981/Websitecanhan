import { CornerDownRight } from "lucide-react";
import { timeAgo } from "@/vo-tri/lib/time";
import { Avatar } from "@/vo-tri/ui/Avatar";
import type { CommentData } from "./types";

export function CommentItem({ comment, onReply, isReply = false }: { comment: CommentData; onReply?: (comment: CommentData) => void; isReply?: boolean }) {
  return (
    <div className={isReply ? "flex gap-2 pl-8" : "flex gap-2"}>
      {isReply && <CornerDownRight className="mt-2 h-3.5 w-3.5 shrink-0 text-vt-text-secondary" />}
      <Avatar name={comment.author.name} avatarUrl={comment.author.avatarUrl} size={32} />
      <div className="min-w-0 flex-1">
        <div className="rounded-vt-md bg-vt-surface px-3 py-2">
          <p className="text-xs font-semibold text-vt-text-primary">{comment.author.name}</p>
          <p className="text-sm text-vt-text-primary">{comment.text}</p>
        </div>
        <div className="mt-1 flex items-center gap-3 px-1 text-xs text-vt-text-secondary">
          <span>{timeAgo(comment.createdAt)}</span>
          {onReply && !isReply && (
            <button type="button" onClick={() => onReply(comment)} className="vt-interactive font-medium hover:text-vt-text-primary">
              Trả lời
            </button>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
