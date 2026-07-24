import { describe, expect, it, beforeEach, afterEach } from "vitest";

/**
 * Proves the credential-isolation boundary end-to-end: with no live
 * Supabase project to connect to yet, every repository/service/action in
 * this Phase must fail loudly and specifically the moment it needs a real
 * connection, rather than crashing confusingly deep inside `@supabase/ssr`
 * or (worse) silently proceeding with `undefined` credentials. The check
 * in server-client.ts runs before `cookies()` is ever touched, so this is
 * exercisable in plain Vitest with no Next.js request context.
 */
describe("createServerSupabaseClient credential isolation", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it("throws a specific, actionable error when both env vars are missing", async () => {
    const { createServerSupabaseClient } = await import("./server-client");
    await expect(createServerSupabaseClient()).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY/s);
  });

  it("throws the same error when only the anon key is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    const { createServerSupabaseClient } = await import("./server-client");
    await expect(createServerSupabaseClient()).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY/s);
  });

  it("getCurrentUser propagates the same missing-config error rather than swallowing it", async () => {
    const { getCurrentUser } = await import("./server-client");
    await expect(getCurrentUser()).rejects.toThrow(/Supabase chưa được cấu hình/);
  });
});
