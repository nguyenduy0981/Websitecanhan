import type { MetadataRoute } from "next";
import { env } from "@/env";

// Only the public marketing/auth pages — gift pages (/g/*) are
// deliberately never listed here, same "unlisted + noindex by default"
// rule as robots.ts and the per-page metadata.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${env.APP_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${env.APP_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${env.APP_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
