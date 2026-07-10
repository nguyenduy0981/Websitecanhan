// Fallback env so `npm run test` works standalone (src/env.ts validates
// these as required). CI/production always provide real values.
process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/lovebox_test";
process.env.SESSION_SECRET ??= "test-only-session-secret-not-for-real-use-000";
process.env.CRON_SECRET ??= "test-only-cron-secret-0000";
process.env.APP_URL ??= "http://localhost:3000";
