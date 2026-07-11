import { z } from "zod";

// Secrets and config only ever enter the app through this file. See
// CLAUDE.md security rules: "Secrets only via env vars validated in src/env.ts."
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),
  // Intentionally optional here — see computeAppUrl() below. If left unset,
  // it's derived from Vercel's own deployment env vars instead of silently
  // defaulting to localhost in production.
  APP_URL: z.string().url().optional(),

  // Cloudflare R2 (S3 API) — optional until media storage is wired up.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // Resend — optional until transactional email is wired up.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // PayOS (VietQR) — optional until payments are wired up.
  PAYOS_CLIENT_ID: z.string().optional(),
  PAYOS_API_KEY: z.string().optional(),
  PAYOS_CHECKSUM_KEY: z.string().optional(),

  VIP_PRICE_VND: z.coerce.number().int().positive().default(49000),

  // Bootstraps the very first SUPER_ADMIN without needing raw DB access
  // (the owner is phone-only — see CLAUDE.md). Optional: if set, the user
  // with this email is auto-promoted to SUPER_ADMIN on register/login.
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
});

export type Env = Omit<z.infer<typeof envSchema>, "APP_URL"> & { APP_URL: string };

/**
 * Resolves the app's own public base URL. An explicit APP_URL always wins
 * (e.g. a real custom domain). Otherwise, on Vercel, derive it from the
 * platform's own env vars so a forgotten APP_URL can never silently point
 * share links / QR codes / password-reset emails at localhost in
 * production — see the bug this fixed: gift share links rendering as
 * "localhost:3000/g/..." because APP_URL was never set on Vercel.
 */
function computeAppUrl(explicit: string | undefined): string {
  if (explicit) return explicit;

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return { ...parsed.data, APP_URL: computeAppUrl(parsed.data.APP_URL) };
}

export const env = loadEnv();

export const isR2Configured = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET,
);

export const isResendConfigured = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);

export const isPayOSConfigured = Boolean(
  env.PAYOS_CLIENT_ID && env.PAYOS_API_KEY && env.PAYOS_CHECKSUM_KEY,
);
