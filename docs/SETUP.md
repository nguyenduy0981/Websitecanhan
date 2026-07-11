# Setup — provisioning external services

All services below have a free tier sufficient for pre-launch usage (see
CLAUDE.md "Cost rules"). Every credential is consumed exclusively through
`src/env.ts` — copy `.env.example` to `.env` and fill in the values described
here.

## Neon (PostgreSQL) — `DATABASE_URL`

1. Create a free project at the Neon dashboard.
2. Open the project's Connection Details panel and copy the **pooled**
   connection string (works correctly with serverless functions on Vercel).
3. Set it as `DATABASE_URL` in `.env` (local) and in Vercel Project Settings →
   Environment Variables (production/preview).

## Cloudflare R2 (media storage) — `R2_*`

Required as of Milestone 6 for gift image uploads to actually work.

1. Create an R2 bucket in the Cloudflare dashboard.
2. Under R2 → Manage API Tokens, create a token with read/write access scoped
   to that bucket. Copy the Account ID, Access Key ID, and Secret Access Key.
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
4. Enable public access on the bucket (R2 bucket Settings → Public Access →
   "Allow Access", or attach a custom domain) and set `R2_PUBLIC_URL` to that
   public base URL (the `r2.dev` URL or your custom domain) — this is what
   gift images are actually served from.
5. Until all of `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/
   `R2_BUCKET`/`R2_PUBLIC_URL` are set, image upload returns a clear
   "not configured yet" error instead of failing unhelpfully — see
   `CLAUDE.md` "Honesty".

## Resend (transactional email) — `RESEND_API_KEY`, `EMAIL_FROM`

1. Create a Resend account, verify a sending domain.
2. Create an API key and set `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to a verified sender address on that domain.

## PayOS (VietQR bank-transfer payments) — `PAYOS_*`

1. Register a merchant account with PayOS and complete verification.
2. From the merchant dashboard, copy the Client ID, API Key, and Checksum Key.
3. Set `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`.
4. VIP activation only ever happens from a verified server-side webhook — see
   the payment security rule in `CLAUDE.md`. Never wire activation to a
   frontend "success" screen.

## Vercel (hosting)

1. Import the repository into Vercel.
2. Set all environment variables above (plus `SESSION_SECRET`, `CRON_SECRET`,
   `APP_URL`) in Project Settings → Environment Variables.
3. **Build command must be set to:**

   ```
   prisma migrate deploy && next build
   ```

   This runs pending Prisma migrations automatically on every deploy, so the
   project owner (who works phone-only) never needs a local terminal to
   apply a migration.
4. Vercel Cron jobs call background job routes under an `Authorization`
   header containing `CRON_SECRET` — configure cron schedules in
   `vercel.json` once job routes exist (Milestone 7 onward).

## Generating secrets

```bash
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 16   # CRON_SECRET
```
