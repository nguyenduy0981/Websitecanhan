import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client — bypasses Row Level Security entirely. Only for
 * the narrow, explicitly-listed cases in docs/BACKEND_ARCHITECTURE.md
 * §6.4 (scheduled jobs like the future leaderboard-snapshot cron; never
 * a per-request code path that echoes client input). Every ordinary
 * read/write should use `server-client.ts`'s cookie-scoped client instead,
 * so RLS applies.
 *
 * Deliberately NOT imported by any Server Action/Route Handler today —
 * there is no privileged server-only job in this codebase yet. This file
 * exists so that when one is needed (the leaderboard snapshot job noted
 * as a future Phase in docs/BACKEND_ARCHITECTURE.md §10), it has a single,
 * already-reviewed place to import from rather than each job hand-rolling
 * its own service-role client.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client chưa được cấu hình: thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. " +
        "Xem docs/BACKEND_ARCHITECTURE.md §11.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
