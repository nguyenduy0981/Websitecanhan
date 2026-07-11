import { prisma } from "@/lib/prisma";

/** Total successfully-activated VIP payments — for the admin monitoring overview. */
export async function countActivatedPayments(): Promise<number> {
  return prisma.payment.count({ where: { status: "ACTIVATED" } });
}
