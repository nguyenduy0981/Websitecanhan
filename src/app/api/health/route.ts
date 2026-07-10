import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

export const GET = withApiHandler(async (_req, { log }) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch (error) {
    log.error({ err: error }, "health check: database unreachable");
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
});
