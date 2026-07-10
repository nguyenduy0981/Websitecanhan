import { z } from "zod";

// Secrets and config only ever enter the app through this file. See
// CLAUDE.md security rules: "Secrets only via env vars validated in src/env.ts."
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),
  APP_URL: z.string().url().default("http://localhost:3000"),

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
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isR2Configured = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET,
);

export const isResendConfigured = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);

export const isPayOSConfigured = Boolean(
  env.PAYOS_CLIENT_ID && env.PAYOS_API_KEY && env.PAYOS_CHECKSUM_KEY,
);
