import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Same gradient + eyes/mouth language as the real Mascot component
// (src/vo-tri/ui/Mascot.tsx "happy" mood), redrawn with flexbox divs since
// favicon generation runs through Satori, not real SVG paths.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF4D8D 0%, #C8FF4D 100%)",
          borderRadius: "50%",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#120E17" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#120E17" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
