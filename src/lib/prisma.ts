import { PrismaClient } from "@prisma/client";

// Reused across hot reloads in dev so we don't exhaust Neon's connection
// limit by creating a new PrismaClient on every module reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
