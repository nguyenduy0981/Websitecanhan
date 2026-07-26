import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/vo-tri/server/supabase/env";

/**
 * Refreshes the Supabase auth session cookie on every navigation — required
 * for @supabase/ssr's cookie-based session to keep working across Server
 * Component requests (which can't write cookies themselves). See
 * docs/BACKEND_ARCHITECTURE.md §9.2.
 *
 * No-ops entirely until NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are configured —
 * same "safe until real config exists" pattern as lib/sound.ts — so this
 * has zero effect on the app today.
 */
export async function middleware(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|manifest.webmanifest).*)"],
};
