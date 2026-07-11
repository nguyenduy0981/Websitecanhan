// Integration tests run against a REAL Postgres (DATABASE_URL must already
// point at one — a local dev instance, or the postgres:16 service
// container in CI, see .github/workflows/ci.yml). Unlike tests/setup.ts
// (unit tests, mocked Prisma), DATABASE_URL is intentionally NOT
// defaulted here — a missing/unreachable one should fail loudly rather
// than silently pretend to pass against nothing.
process.env.SESSION_SECRET ??= "integration-test-session-secret-not-for-real-use-0";
process.env.CRON_SECRET ??= "integration-test-cron-secret-0000";
process.env.APP_URL ??= "http://localhost:3000";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required for integration tests. Point it at a real, disposable Postgres database — see docs/SETUP.md.",
  );
}
