import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// This regression-tests a real production bug: share links rendered as
// "localhost:3000/g/..." because APP_URL was never set on Vercel, and the
// old code just defaulted straight to localhost. env.ts now derives it
// from Vercel's own deployment env vars instead. Each test re-imports the
// module fresh (vi.resetModules) since env.ts computes `env` once at
// import time.
const BASE_ENV = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/lovebox_test",
  SESSION_SECRET: "test-only-session-secret-not-for-real-use-000",
  CRON_SECRET: "test-only-cron-secret-0000",
};

const ENV_KEYS = [
  "APP_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
  ...Object.keys(BASE_ENV),
] as const;

const originalValues = new Map<string, string | undefined>();

beforeEach(() => {
  vi.resetModules();
  for (const key of ENV_KEYS) {
    originalValues.set(key, process.env[key]);
    delete process.env[key];
  }
  Object.assign(process.env, BASE_ENV);
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const original = originalValues.get(key);
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
});

describe("env.APP_URL", () => {
  it("uses an explicit APP_URL when set, even on Vercel", async () => {
    process.env.APP_URL = "https://lovebox.vn";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "websitecanhan-six.vercel.app";
    const { env } = await import("@/env");
    expect(env.APP_URL).toBe("https://lovebox.vn");
  });

  it("falls back to VERCEL_PROJECT_PRODUCTION_URL when APP_URL is unset", async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "websitecanhan-six.vercel.app";
    const { env } = await import("@/env");
    expect(env.APP_URL).toBe("https://websitecanhan-six.vercel.app");
  });

  it("falls back to VERCEL_URL when only that is set", async () => {
    process.env.VERCEL_URL = "websitecanhan-abc123.vercel.app";
    const { env } = await import("@/env");
    expect(env.APP_URL).toBe("https://websitecanhan-abc123.vercel.app");
  });

  it("only falls back to localhost when neither APP_URL nor any Vercel env var is set", async () => {
    const { env } = await import("@/env");
    expect(env.APP_URL).toBe("http://localhost:3000");
  });
});
