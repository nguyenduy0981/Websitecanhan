# LoveBox

Hộp quà kỹ thuật số cảm xúc, mobile-first, thị trường Việt Nam. This is a real
production web product — see [`CLAUDE.md`](./CLAUDE.md) for the binding rules
and [`specs/SPEC.md`](./specs/SPEC.md) for the full product spec.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · PostgreSQL (Neon)
+ Prisma · Cloudflare R2 · PayOS (VietQR) · Vitest · Playwright.

## Getting started

```bash
npm install
cp .env.example .env   # fill in real values — see docs/SETUP.md
npm run dev
```

## Verify commands

Run before every commit and required to pass in CI:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project layout

- `src/app/` — Next.js App Router routes.
- `src/modules/*` — modular monolith; each module exposes its public API via
  `index.ts` only. Never import another module's internals.
- `src/config/business-rules.ts` — non-negotiable business constants (gift
  lifetimes, quotas). See `CLAUDE.md`.
- `src/env.ts` — the only place environment variables are read and validated.
- `src/lib/logger.ts` — structured (pino) logging; redacts secrets/PII fields.
- `src/lib/errors.ts` + `src/lib/api-handler.ts` — standard `AppError`
  hierarchy and route wrapper producing a uniform `{ error: { code, message } }`
  response; unexpected errors are logged in full server-side but never leak
  details to the client.
- `src/lib/prisma.ts` — cached Prisma client singleton.
- `src/lib/validation.ts` — `parseOrThrow(schema, data)` zod helper, throws `ValidationError`.
- `src/lib/request.ts` — `getClientIp()` for rate limiting/audit logs.
- `src/modules/auth/` — register/login/logout, password reset, session
  cookies, DB-backed rate limiting, argon2id hashing. Routes under
  `src/app/api/auth/*`.
- `prisma/schema.prisma` — database schema. `prisma/migrations/` holds
  applied migrations; run `prisma migrate dev` locally to add new ones.
- `tests/unit/` — Vitest unit tests. `tests/e2e/` — Playwright E2E tests.
- `docs/SETUP.md` — provisioning Neon, Cloudflare R2, Resend, PayOS, Vercel.
- `docs/MILESTONE_REPORTS.md` — report appended after every milestone.

## Deployment

Deployed on Vercel. The Vercel build command must be:

```
prisma migrate deploy && next build
```

so schema migrations run automatically on every deploy (the project owner
works phone-only and cannot run a local terminal).
