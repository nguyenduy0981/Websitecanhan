import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Root-level, so it's inherited as the default social preview image for
// every page that doesn't set its own `openGraph.images` — including gift
// pages (which never derive one from real gift content, see
// src/app/g/[slug]/page.tsx's static metadata and CLAUDE.md's "never leak
// gift content via a social preview" rule). This is deliberately generic
// branding, safe to show for any link.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e11d48, #be123c)",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 700 }}>LoveBox</div>
      <div style={{ fontSize: 32, marginTop: 16, opacity: 0.9 }}>Hộp quà kỹ thuật số cảm xúc</div>
    </div>,
    { ...size },
  );
}
