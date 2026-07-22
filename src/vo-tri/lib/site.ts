/**
 * No production domain exists yet (no deployment finalized) — this reads
 * `NEXT_PUBLIC_SITE_URL` and falls back to localhost rather than
 * hardcoding a guessed domain. Set the env var once real hosting exists;
 * sitemap.ts/robots.ts/opengraph-image.tsx all read from here so there's
 * one place to update.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
