import { getClientAndOptionalUserId } from "@/vo-tri/server/require-auth";
import { getShellUser } from "@/vo-tri/server/services/profile-service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { VoTriUser } from "@/vo-tri/shell/types";

/** Mirrors middleware.ts's own env-var check — true only once real Supabase credentials exist. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * What any Server Component that renders on *every* request (root layout,
 * `/profile`) must call instead of `getClientAndOptionalUserId()` directly.
 * `createServerSupabaseClient()` throws its "not configured" error by
 * design — the right behavior for a Server Action a user just triggered,
 * but wrong for a page that renders on every view (including `next
 * build`'s static generation): it must degrade to the guest state instead
 * of crashing the whole app whenever Supabase isn't configured (still true
 * for every environment except wherever real credentials are actually set).
 */
export async function getOptionalSession(): Promise<{ client: SupabaseClient<Database>; userId: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const { client, userId } = await getClientAndOptionalUserId();
  if (!userId) return null;
  return { client, userId };
}

/** What `RootLayout` calls to decide whether Header/Sidebar render the guest state or a real logged-in user. */
export async function getSessionUser(): Promise<VoTriUser | undefined> {
  const session = await getOptionalSession();
  if (!session) return undefined;

  const result = await getShellUser(session.client, session.userId);
  return result.ok ? result.data : undefined;
}
