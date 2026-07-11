"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Đã hết hạn";
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
  if (hours > 0) return `Còn ${hours} giờ ${minutes} phút`;
  return `Còn ${minutes} phút`;
}

/** Live countdown to a gift's activeExpiresAt, re-rendering once a minute.
 * Each label change remounts the span (via `key`) to replay a tiny "tick"
 * pop — cheap since it only fires once/minute, never per-frame. */
export function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [label, setLabel] = useState(() => formatRemaining(target - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setLabel(formatRemaining(target - Date.now())), 60_000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span key={label} className="lb-scale-in inline-block text-xs text-muted-foreground">
      {label}
    </span>
  );
}
