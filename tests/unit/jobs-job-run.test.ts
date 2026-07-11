import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { jobRun: { create: vi.fn() } },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const { runJob } = await import("@/modules/jobs/job-run");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runJob", () => {
  it("records a successful run and returns its item count", async () => {
    prismaMock.jobRun.create.mockResolvedValue({});
    const result = await runJob("expire", async () => 4);

    expect(result).toEqual({ name: "expire", ok: true, itemsProcessed: 4 });
    const data = prismaMock.jobRun.create.mock.calls[0]![0].data;
    expect(data.name).toBe("expire");
    expect(data.ok).toBe(true);
    expect(data.itemsProcessed).toBe(4);
  });

  it("never throws even if the job function fails, and still records the run", async () => {
    prismaMock.jobRun.create.mockResolvedValue({});
    const result = await runJob("purge", async () => {
      throw new Error("boom");
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("boom");
    const data = prismaMock.jobRun.create.mock.calls[0]![0].data;
    expect(data.ok).toBe(false);
    expect(data.error).toBe("boom");
  });
});
