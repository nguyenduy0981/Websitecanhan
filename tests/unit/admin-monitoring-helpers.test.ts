import { beforeEach, expect, it, vi } from "vitest";

// Light coverage for the small count/query helpers the admin monitoring
// page composes across modules — mostly making sure each queries the
// right table/filter, and that countGiftsByStatus always returns every
// status key (even ones with zero gifts) so the UI doesn't need to guard
// against missing keys.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { count: vi.fn() },
    gift: { groupBy: vi.fn() },
    payment: { count: vi.fn() },
    report: { count: vi.fn() },
    jobRun: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { countUsers } = await import("@/modules/auth/admin");
const { countGiftsByStatus } = await import("@/modules/gifts/admin");
const { countActivatedPayments } = await import("@/modules/payments/query");
const { countOpenReports } = await import("@/modules/admin/reports");
const { listRecentJobRuns } = await import("@/modules/jobs/query");

beforeEach(() => {
  vi.clearAllMocks();
});

it("countUsers counts all users", async () => {
  prismaMock.user.count.mockResolvedValue(7);
  await expect(countUsers()).resolves.toBe(7);
});

it("countGiftsByStatus fills in zero for statuses with no gifts", async () => {
  prismaMock.gift.groupBy.mockResolvedValue([
    { status: "ACTIVE", _count: { _all: 3 } },
    { status: "DRAFT", _count: { _all: 1 } },
  ]);

  const counts = await countGiftsByStatus();

  expect(counts.ACTIVE).toBe(3);
  expect(counts.DRAFT).toBe(1);
  expect(counts.EXPIRED).toBe(0);
  expect(counts.SUSPENDED).toBe(0);
  expect(Object.keys(counts)).toHaveLength(7);
});

it("countActivatedPayments only counts ACTIVATED payments", async () => {
  prismaMock.payment.count.mockResolvedValue(4);
  await expect(countActivatedPayments()).resolves.toBe(4);
  expect(prismaMock.payment.count).toHaveBeenCalledWith({ where: { status: "ACTIVATED" } });
});

it("countOpenReports only counts OPEN reports", async () => {
  prismaMock.report.count.mockResolvedValue(2);
  await expect(countOpenReports()).resolves.toBe(2);
  expect(prismaMock.report.count).toHaveBeenCalledWith({ where: { status: "OPEN" } });
});

it("listRecentJobRuns orders newest first and respects the limit", async () => {
  prismaMock.jobRun.findMany.mockResolvedValue([]);
  await listRecentJobRuns(10);
  expect(prismaMock.jobRun.findMany).toHaveBeenCalledWith({
    orderBy: { startedAt: "desc" },
    take: 10,
  });
});
