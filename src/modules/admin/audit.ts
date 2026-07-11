import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

/**
 * Best-effort audit trail. Never throws — a logging failure must never
 * block the actual moderation action it's recording (same graceful-
 * degradation pattern as recordGiftView in the gifts module).
 */
export async function writeAuditLog(
  actorId: string | null,
  action: string,
  targetType: string,
  targetId: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, targetType, targetId, meta: meta as Prisma.InputJsonValue },
    });
  } catch (error) {
    logger.warn({ err: error, action, targetType, targetId }, "failed to write audit log (non-fatal)");
  }
}
