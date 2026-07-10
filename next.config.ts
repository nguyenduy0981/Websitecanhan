import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Gift pages are unlisted by default — never indexed, regardless of
        // any per-page metadata. See CLAUDE.md: "Gifts are unlisted + noindex
        // by default. Marketing pages indexable; gift pages never."
        source: "/g/:slug*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
