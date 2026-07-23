import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// 192x192 PWA icon (manifest.ts's `icons` array) — same gradient + happy-face
// language as icon.tsx/apple-icon.tsx, just sized for Android home-screen
// install. A plain Route Handler rather than the `icon.tsx` convention since
// that convention only owns one size per file; manifest icons need explicit,
// differently-sized files to list.
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
          <div style={{ display: "flex", gap: 36 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#120E17" }} />
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#120E17" }} />
          </div>
          <div
            style={{
              width: 68,
              height: 34,
              borderBottomLeftRadius: 68,
              borderBottomRightRadius: 68,
              background: "#120E17",
            }}
          />
        </div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
