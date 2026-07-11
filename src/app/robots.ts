import type { MetadataRoute } from "next";
import { env } from "@/env";

// Defense in depth on top of the X-Robots-Tag header + <meta robots> that
// already block indexing of individual gift pages (see CLAUDE.md: "Gifts
// are unlisted + noindex by default") — this stops crawlers from even
// requesting /g/*, /dashboard, /gifts/*, and /admin in the first place.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/g/", "/dashboard", "/gifts/", "/admin"],
    },
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
