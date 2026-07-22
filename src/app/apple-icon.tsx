import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 34 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#120E17" }} />
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#120E17" }} />
          </div>
          <div
            style={{
              width: 64,
              height: 32,
              borderBottomLeftRadius: 64,
              borderBottomRightRadius: 64,
              background: "#120E17",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
