import { prisma } from "@/lib/prisma";

const TABLES = [
  "users",
  "sessions",
  "password_reset_tokens",
  "gifts",
  "gift_blocks",
  "media_assets",
  "music_tracks",
  "payments",
  "reports",
  "gift_views",
  "analytics_events",
  "audit_logs",
  "job_runs",
  "rate_limit_hits",
];

/** Wipes every app table between tests so each test starts from a clean, known state. */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.join(", ")} RESTART IDENTITY CASCADE;`);
}

export { prisma };
