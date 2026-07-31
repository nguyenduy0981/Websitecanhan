import type { MetadataRoute } from "next";

// Enables "Add to Home Screen" install prompts — a real, no-backend step
// toward a shippable product, not just a browser tab. Colors match the
// real design tokens (`--vt-bg`/`--vt-primary`) rather than guessed hex.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VÔ TRI",
    short_name: "VÔ TRI",
    description: "Nơi sự vô tri trở thành nghệ thuật.",
    start_url: "/",
    display: "standalone",
    background_color: "#120E17",
    theme_color: "#120E17",
    lang: "vi",
    icons: [
      { src: "/icon192", sizes: "192x192", type: "image/png" },
      { src: "/icon512", sizes: "512x512", type: "image/png" },
    ],
  };
}
