import { createServerSupabaseClient } from "@/vo-tri/server/supabase/server-client";
import { fail, type ServiceResult } from "@/vo-tri/server/errors";

/**
 * Every mutating Server Action needs the same 3 lines (get the client, get
 * the user, bail with a clean error if there isn't one) — extracted once
 * `record_activity_session`, `claim_quest`, `claim_milestone`,
 * `toggle_follow`, `postComment`, `setReaction` all needed it verbatim.
 *
 * `createServerSupabaseClient()` itself throws if
 * NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't configured (see
 * server-client.ts) — deliberately NOT caught here. That's a deployment
 * misconfiguration, not a normal "user isn't signed in" case, and should
 * fail loudly during setup rather than be swallowed into a generic
 * `ServiceResult` error that looks like any other expected failure.
 */
export async function requireAuthenticatedClient(): Promise<
  { client: Awaited<ReturnType<typeof createServerSupabaseClient>>; userId: string } | { error: ServiceResult<never> }
> {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { error: fail("NOT_AUTHENTICATED") };
  return { client, userId: user.id };
}

/** For reads that work whether or not someone is signed in (client is still needed for RLS-scoped public reads). */
export async function getClientAndOptionalUserId(): Promise<{
  client: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string | null;
}> {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return { client, userId: user?.id ?? null };
}
