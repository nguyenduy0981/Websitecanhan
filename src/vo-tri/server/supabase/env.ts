/**
 * Single source of truth for "is the public Supabase config present" —
 * a real, grep-confirmed duplication found in the production-readiness
 * pass: `server-client.ts`, `middleware.ts`, and `session.ts` each
 * independently re-checked
 * `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` presence.
 * Consolidated per this repo's own "hai component giống nhau thì hợp
 * nhất" rule (see CLAUDE.md's Prompt 10 entry, which did the same for
 * check-in-toast/timeAgo/avatar-fallback duplication). Deliberately does
 * NOT cover `SUPABASE_SERVICE_ROLE_KEY` — that's a different pair of
 * concerns (admin-client.ts), not the same check repeated.
 *
 * Plain `process.env` reads only, no Node-only APIs — safe to import
 * from `middleware.ts`, which runs on the Edge runtime.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
