import type { NextConfig } from "next";

// Deliberately not a strict nonce-based CSP (that needs per-request
// middleware) — a pragmatic, build-time policy that still meaningfully
// shrinks the attack surface: no script/object loading from third-party
// origins, no framing (clickjacking), no <base> tag hijacking, forms only
// submit same-origin. XSS's primary defense is still React's automatic
// JSX escaping (see CLAUDE.md: "User-generated text ... treat as
// hostile") — this is defense-in-depth on top of that, not a replacement.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
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
