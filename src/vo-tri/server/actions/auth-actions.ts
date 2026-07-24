"use server";

import { createServerSupabaseClient } from "@/vo-tri/server/supabase/server-client";
import * as authService from "@/vo-tri/server/services/auth-service";
import type { ServiceResult } from "@/vo-tri/server/errors";
import type { SignInInput, SignUpInput } from "@/vo-tri/server/validation/auth";

export async function signUpAction(input: SignUpInput): Promise<ServiceResult<{ userId: string }>> {
  const client = await createServerSupabaseClient();
  return authService.signUp(client, input);
}

export async function signInAction(input: SignInInput): Promise<ServiceResult<{ userId: string }>> {
  const client = await createServerSupabaseClient();
  return authService.signIn(client, input);
}

export async function signOutAction(): Promise<ServiceResult<null>> {
  const client = await createServerSupabaseClient();
  return authService.signOut(client);
}
