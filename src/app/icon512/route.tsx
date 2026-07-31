import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// 512x512 PWA icon — see icon192/route.tsx for why this is a plain Route
// Handler instead of the `icon.tsx` file convention.
export async function GET() {
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", gap: 96 }}>
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#120E17" }} />
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#120E17" }} />
          </div>
          <div
            style={{
              width: 182,
              height: 91,
              borderBottomLeftRadius: 182,
              borderBottomRightRadius: 182,
              background: "#120E17",
            }}
          />
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
