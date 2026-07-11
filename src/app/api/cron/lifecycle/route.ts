import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";
import { env } from "@/env";
import { runLifecycleJobs } from "@/modules/jobs";

export const maxDuration = 60;

export const GET = withApiHandler(async (req: NextRequest, { log }) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    throw new UnauthorizedError("Invalid cron secret");
  }

  const summary = await runLifecycleJobs();
  log.info(summary, "lifecycle cron run completed");

  return NextResponse.json(summary);
});
