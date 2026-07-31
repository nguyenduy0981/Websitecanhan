"use client";

import { useEffect } from "react";
import "./globals.css";
import { errorCopy } from "@/vo-tri/copy/microcopy";
import { voTriFontVariables } from "@/vo-tri/fonts";

/**
 * Only fires if the root layout itself throws (error.tsx can't catch
 * that — it lives *inside* the layout). Must render its own <html>/<body>
 * since the real layout is gone at that point, and deliberately skips
 * AppShell/providers entirely so this fallback has as little as possible
 * left to fail. Kept in the brand voice rather than Next's default blank
 * error screen, styled with raw inline styles (no Tailwind utility
 * classes) so it still renders correctly even if the CSS pipeline is
 * part of what broke.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[vo-tri] root layout error", error);
  }, [error]);

  return (
    <html lang="vi" className={voTriFontVariables}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#120E17",
          color: "#F6F1F8",
          fontFamily: "var(--font-vt-body, system-ui, sans-serif)",
        }}
      >
        <p style={{ fontSize: "2.5rem" }} aria-hidden>
          🫠
        </p>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{errorCopy.generic.title}</h1>
        <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#A99BB5" }}>{errorCopy.generic.description}</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            borderRadius: "9999px",
            border: "none",
            padding: "0.625rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#120E17",
            backgroundColor: "#FF4D8D",
            cursor: "pointer",
          }}
        >
          Thử lại xem
        </button>
      </body>
    </html>
  );
}
