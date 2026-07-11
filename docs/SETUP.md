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

### Local Postgres for `npm run test:integration`

The Neon connection above is for the deployed app. To run the integration
test suite locally (real constraints/transactions, not a mocked Prisma
client), point `DATABASE_URL` at any disposable local Postgres 16+ instead
— it does not need to be Neon:

```bash
createdb lovebox_test
DATABASE_URL="postgresql://<user>@localhost:5432/lovebox_test" npx prisma migrate deploy
DATABASE_URL="postgresql://<user>@localhost:5432/lovebox_test" npm run test:integration
```

The test suite truncates all tables between tests (`tests/integration/
db-helpers.ts`) — never point it at a database with real data.

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

1. Register a merchant account at https://payos.vn and complete verification.
2. From the merchant dashboard, copy the Client ID, API Key, and Checksum Key.
3. Set `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` in Vercel.
4. **Register the webhook URL** in the PayOS dashboard (Webhooks section):
   `https://<your-domain>/api/payments/webhook/payos`. PayOS sends a test
   request to confirm the URL responds correctly before activating it.
5. VIP activation only ever happens from that verified server-side
   webhook — see the P0 payment security rule in `CLAUDE.md`. Never wire
   activation to a frontend "success" screen; the app already doesn't (the
   return page after checkout only says "confirming, refresh to check").
6. Until all three `PAYOS_*` vars are set, VIP checkout returns a clear
   "not configured yet" error (503) instead of failing unhelpfully.
7. This integration was built against the official `@payos/node` SDK
   (v2.0.5) using its published TypeScript types — recommend a real
   end-to-end test purchase once credentials are configured, since it
   hasn't been possible to test against the live PayOS API from this
   environment.

## First admin account — `SUPER_ADMIN_EMAIL`

The owner has no direct database access, so this is the only way to get
the first admin (moderator/report review) role:

1. In Vercel Project Settings → Environment Variables, set
   `SUPER_ADMIN_EMAIL` to the email of the LoveBox account you want to
   manage reports/moderation from (this is your normal login email on the
   site itself — it does not need to match any other account you have).
2. Log in (or register, if you don't have an account yet) with that exact
   email on the live site. You're promoted to `SUPER_ADMIN` automatically
   on that login — no extra step, no DB access needed.
3. A "Quản trị" (Admin) link then appears on your dashboard, linking to
   `/admin/reports`.
4. From `/admin/users` (SUPER_ADMIN only) you can then grant `MODERATOR`/
   `ADMIN` to other accounts by email, without needing to change
   `SUPER_ADMIN_EMAIL` again. That variable only needs to stay set for as
   long as you might need to re-bootstrap (it's safe to leave it set
   indefinitely — it self-heals that one account back to SUPER_ADMIN on
   every login, but never touches any other account's role).

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
