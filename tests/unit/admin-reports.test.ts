import { beforeEach, describe, expect, it, vi } from "vitest";

// Reports are the public-facing entry point into moderation (anonymous
// visitors on /g/[slug] can file one) — these tests cover the "DRAFT gift
// must not be reportable" leak-prevention rule, rate limiting, and that
// resolving a report correctly delegates to (and gates repeat use of)
// suspendGift.
const { prismaMock, giftsMock, authMock, moderationMock, auditMock } = vi.hoisted(() => ({
  prismaMock: {
    report: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
  giftsMock: {
    getGiftBySlug: vi.fn(),
    classifyGiftForViewer: vi.fn(),
  },
  authMock: {
    checkRateLimit: vi.fn(),
    RATE_LIMITS: { report: { limit: 5, windowMs: 60 * 60 * 1000 } },
  },
  moderationMock: {
    suspendGift: vi.fn(),
  },
  auditMock: {
    writeAuditLog: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/gifts", () => giftsMock);
vi.mock("@/modules/auth", () => authMock);
vi.mock("@/modules/admin/moderation", () => moderationMock);
vi.mock("@/modules/admin/audit", () => auditMock);

const { createReport, resolveReport } = await import("@/modules/admin/reports");
const { ConflictError, NotFoundError } = await import("@/lib/errors");

beforeEach(() => {
  vi.clearAllMocks();
  authMock.checkRateLimit.mockResolvedValue(undefined);
  auditMock.writeAuditLog.mockResolvedValue(undefined);
});

describe("createReport", () => {
  it("checks the rate limit before doing anything else", async () => {
    authMock.checkRateLimit.mockRejectedValue(new Error("rate limited"));

    await expect(
      createReport({ slug: "abc123", reason: "SPAM" }, null, "203.0.113.1"),
    ).rejects.toThrow("rate limited");
    expect(giftsMock.getGiftBySlug).not.toHaveBeenCalled();
  });

  it("rejects an unknown slug", async () => {
    giftsMock.getGiftBySlug.mockResolvedValue(null);

    await expect(
      createReport({ slug: "nope", reason: "SPAM" }, null, "203.0.113.1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMock.report.create).not.toHaveBeenCalled();
  });

  it("treats a DRAFT gift as not found, same as the public viewer", async () => {
    giftsMock.getGiftBySlug.mockResolvedValue({ id: "gift_1", status: "DRAFT" });
    giftsMock.classifyGiftForViewer.mockReturnValue({ type: "not_found" });

    await expect(
      createReport({ slug: "draft-slug", reason: "SPAM" }, null, "203.0.113.1"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMock.report.create).not.toHaveBeenCalled();
  });

  it("creates a report for a reportable (active/unavailable) gift, anonymous reporter allowed", async () => {
    giftsMock.getGiftBySlug.mockResolvedValue({ id: "gift_1", status: "ACTIVE" });
    giftsMock.classifyGiftForViewer.mockReturnValue({ type: "active" });
    prismaMock.report.create.mockResolvedValue({});

    await createReport({ slug: "abc123", reason: "INAPPROPRIATE", details: "..." }, null, "203.0.113.1");

    expect(prismaMock.report.create).toHaveBeenCalledWith({
      data: { giftId: "gift_1", reporterId: null, reason: "INAPPROPRIATE", details: "..." },
    });
  });
});

describe("resolveReport", () => {
  it("rejects an unknown report", async () => {
    prismaMock.report.findUnique.mockResolvedValue(null);
    await expect(resolveReport("report_1", "mod_1", "DISMISS")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects resolving an already-resolved report", async () => {
    prismaMock.report.findUnique.mockResolvedValue({ id: "report_1", status: "DISMISSED", giftId: "gift_1" });
    await expect(resolveReport("report_1", "mod_1", "DISMISS")).rejects.toBeInstanceOf(ConflictError);
  });

  it("DISMISS marks the report DISMISSED without touching the gift", async () => {
    prismaMock.report.findUnique.mockResolvedValue({ id: "report_1", status: "OPEN", giftId: "gift_1" });
    prismaMock.report.update.mockResolvedValue({ id: "report_1", status: "DISMISSED" });

    await resolveReport("report_1", "mod_1", "DISMISS");

    expect(moderationMock.suspendGift).not.toHaveBeenCalled();
    expect(prismaMock.report.update).toHaveBeenCalledWith({
      where: { id: "report_1" },
      data: { status: "DISMISSED", resolvedBy: "mod_1", resolvedAt: expect.any(Date) },
    });
  });

  it("SUSPEND both suspends the gift and marks the report ACTION_TAKEN", async () => {
    prismaMock.report.findUnique.mockResolvedValue({ id: "report_1", status: "OPEN", giftId: "gift_1" });
    prismaMock.report.update.mockResolvedValue({ id: "report_1", status: "ACTION_TAKEN" });
    moderationMock.suspendGift.mockResolvedValue({});

    await resolveReport("report_1", "mod_1", "SUSPEND");

    expect(moderationMock.suspendGift).toHaveBeenCalledWith("gift_1", "mod_1", { reportId: "report_1" });
    expect(prismaMock.report.update).toHaveBeenCalledWith({
      where: { id: "report_1" },
      data: { status: "ACTION_TAKEN", resolvedBy: "mod_1", resolvedAt: expect.any(Date) },
    });
  });
});
