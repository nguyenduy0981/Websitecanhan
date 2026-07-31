import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default OG card for every route that doesn't define its own — dark-plum
// background (never pure black, per the brand's non-negotiable rule),
// mascot-echoing gradient blob, wordmark, tagline. No fabricated stats or
// social-proof numbers on it, just the brand line.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#120E17",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF4D8D 0%, #C8FF4D 100%)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#120E17" }} />
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#120E17" }} />
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, color: "#F6F1F8", letterSpacing: 4 }}>
          VÔ TRI
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#A99BB5" }}>Ở đây, vô tri là một kỹ năng.</div>
      </div>
    ),
    { ...size },
  );
}
