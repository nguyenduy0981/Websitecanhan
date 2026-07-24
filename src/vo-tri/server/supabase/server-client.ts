import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cookie-scoped Supabase client for Server Components/Actions — every
 * query through this client runs as the actual logged-in user (or `anon`
 * when there's no session), so RLS applies exactly as designed in
 * docs/BACKEND_ARCHITECTURE.md §6. This is the client every
 * repository/service/action should use; `admin-client.ts` is the narrow
 * exception, not the default.
 *
 * Throws a clear, actionable error instead of a confusing runtime crash
 * when the env vars aren't configured yet — same "no-op/fail loud until
 * real config exists" pattern as lib/sound.ts and lib/analytics.ts.
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase chưa được cấu hình: thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Xem docs/BACKEND_ARCHITECTURE.md §11 để biết cách lấy 2 giá trị này từ project Supabase thật.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render (not a Server Action/Route
          // Handler) — cookies can't be written there. Harmless as long as
          // middleware.ts is refreshing the session on navigations, which
          // it does (see middleware.ts at the repo root).
        }
      },
    },
  });
}

/** `null` when no session exists — every route currently checking a local `currentUser === undefined` pattern should switch to this. */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
