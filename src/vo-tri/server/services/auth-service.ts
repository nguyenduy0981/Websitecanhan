import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, mapSupabaseError, ok, validationFail, type ServiceResult } from "@/vo-tri/server/errors";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "@/vo-tri/server/validation/auth";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;

/**
 * Thin wrapper over Supabase Auth (no custom `sessions` table needed —
 * Supabase manages that; see docs/BACKEND_ARCHITECTURE.md §9.2). The
 * `handle_new_user` trigger (supabase/migrations/20260724000002_profiles.sql)
 * reads `username`/`display_name` back out of `raw_user_meta_data`, so
 * `signUp` must pass them through `options.data` for the trigger to see them.
 */
export async function signUp(client: Client, input: SignUpInput): Promise<ServiceResult<{ userId: string }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { username: parsed.data.username, display_name: parsed.data.displayName } },
  });
  if (error) return mapSupabaseError(error);
  if (!data.user) return fail("generic");

  return ok({ userId: data.user.id });
}

export async function signIn(client: Client, input: SignInInput): Promise<ServiceResult<{ userId: string }>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await client.auth.signInWithPassword(parsed.data);
  if (error) return mapSupabaseError(error);

  return ok({ userId: data.user.id });
}

export async function signOut(client: Client): Promise<ServiceResult<null>> {
  const { error } = await client.auth.signOut();
  if (error) return mapSupabaseError(error);
  return ok(null);
}
