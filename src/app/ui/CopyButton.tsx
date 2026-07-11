"use client";

import { useState } from "react";

type Props = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

/** Copy-to-clipboard button with a short "copied" feedback animation. */
export function CopyButton({ value, label = "Sao chép", copiedLabel = "Đã copy", className }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable/blocked — nothing to recover from client-side.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`lb-btn rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className ?? ""}`}
    >
      {copied ? (
        <span key="copied" className="lb-scale-in inline-flex items-center gap-1 text-green-600">
          ✓ {copiedLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
