"use client";

import { useState } from "react";
import { Mascot } from "@/vo-tri/ui/Mascot";
import { Skeleton } from "@/vo-tri/ui/Skeleton";
import { ErrorState } from "@/vo-tri/ui/StatePanel";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import type { CommentData } from "./types";

export function CommentSection({
  status,
  comments,
  onSubmitComment,
  onRetry,
}: {
  status: "loading" | "error" | "ready";
  comments: CommentData[];
  onSubmitComment: (text: string, replyingTo?: CommentData) => void;
  onRetry?: () => void;
}) {
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-4/5" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState title="Ơ, tải bình luận không nổi..." description="Chắc mạng đang lag. Thử lại xem." action={onRetry ? <button type="button" onClick={onRetry} className="vt-interactive text-sm font-medium text-vt-primary">Thử lại xem</button> : undefined} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Mascot mood="sleepy" size="md" />
          <p className="text-sm font-medium text-vt-text-primary">Chưa ai nói gì cả</p>
          <p className="max-w-xs text-xs text-vt-text-secondary">Bình luận đầu tiên luôn là bình luận dũng cảm nhất.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={setReplyingTo} />
          ))}
        </div>
      )}

      <CommentComposer
        replyingToName={replyingTo?.author.name}
        onCancelReply={() => setReplyingTo(null)}
        onSubmit={(text) => {
          onSubmitComment(text, replyingTo ?? undefined);
          setReplyingTo(null);
        }}
      />
    </div>
  );
}
