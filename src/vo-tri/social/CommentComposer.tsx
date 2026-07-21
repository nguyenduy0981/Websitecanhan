"use client";

import { Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/vo-tri/ui/Button";
import { Textarea } from "@/vo-tri/ui/Input";

export function CommentComposer({
  onSubmit,
  replyingToName,
  onCancelReply,
  placeholder = "Nói gì đó đi (đừng vô tri quá)...",
}: {
  onSubmit: (text: string) => void;
  replyingToName?: string;
  onCancelReply?: () => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <div className="flex flex-col gap-2">
      {replyingToName && (
        <div className="flex items-center justify-between rounded-vt-md bg-vt-surface px-3 py-1.5 text-xs text-vt-text-secondary">
          <span>
            Đang trả lời <span className="font-medium text-vt-text-primary">{replyingToName}</span>
          </span>
          <button type="button" onClick={onCancelReply} aria-label="Hủy trả lời" className="vt-interactive rounded-vt-full p-1 hover:text-vt-text-primary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          className="min-h-11 flex-1 resize-none"
          rows={1}
        />
        <Button variant="primary" size="sm" onClick={handleSubmit} aria-label="Gửi bình luận">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
