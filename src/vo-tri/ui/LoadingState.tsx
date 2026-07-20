"use client";

import { useEffect, useState } from "react";
import { loadingMessages, pickLoadingMessage } from "@/vo-tri/copy/microcopy";
import { cn } from "@/vo-tri/lib/cn";
import { Mascot } from "./Mascot";

/**
 * Full-screen/section loading. The message rotates every few seconds
 * instead of sitting frozen on one line — "Loading thú vị", per the
 * brief, not a static spinner + word.
 */
export function LoadingState({ className }: { className?: string }) {
  // Lazy initializer avoids a hydration mismatch (server render can't
  // know the random pick the client would make on mount).
  const [message, setMessage] = useState<string>(loadingMessages[0]);

  useEffect(() => {
    setMessage(pickLoadingMessage());
    const id = setInterval(() => setMessage(pickLoadingMessage()), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-4 px-6 py-12 text-center", className)} role="status" aria-live="polite">
      <Mascot mood="thinking" size="lg" />
      <p key={message} className="vt-fade-up text-sm text-vt-text-secondary">
        {message}
      </p>
    </div>
  );
}
