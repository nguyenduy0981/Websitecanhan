import { beforeEach, describe, expect, it, vi } from "vitest";

// suspendGift/unsuspendGift are the P0 moderation control flow: they must
// never lose the pre-suspension status (prevStatus) and must never let a
// double-suspend or a suspend-then-suspend race throw a confusing error.
// audit.ts's prisma.auditLog.create is real code (not mocked away) so
// these tests also exercise the audit-log write path end to end.
const { prismaMock, giftsMock } = vi.hoisted(() => ({
  prismaMock: {
    auditLog: { create: vi.fn() },
  },
  giftsMock: {
    getGiftForAdmin: vi.fn(),
    setGiftStatusForAdmin: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/gifts", () => giftsMock);

const { suspendGift, unsuspendGift } = await import("@/modules/admin/moderation");
const { ConflictError } = await import("@/lib/errors");

function fakeGift(overrides: Record<string, unknown> = {}) {
  return {
    id: "gift_1",
    status: "ACTIVE",
    prevStatus: null,
    suspendedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.auditLog.create.mockResolvedValue({});
});

describe("suspendGift", () => {
  it("suspends an ACTIVE gift, recording its prevStatus", async () => {
    giftsMock.getGiftForAdmin.mockResolvedValue(fakeGift({ status: "ACTIVE" }));
    giftsMock.setGiftStatusForAdmin.mockResolvedValue(fakeGift({ status: "SUSPENDED", prevStatus: "ACTIVE" }));

    await suspendGift("gift_1", "mod_1");

    expect(giftsMock.setGiftStatusForAdmin).toHaveBeenCalledWith("gift_1", {
      status: "SUSPENDED",
      prevStatus: "ACTIVE",
      suspendedAt: expect.any(Date),
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    const auditData = prismaMock.auditLog.create.mock.calls[0]![0].data;
    expect(auditData.action).toBe("GIFT_SUSPENDED");
    expect(auditData.actorId).toBe("mod_1");
  });

  it("is idempotent: suspending an already-suspended gift is a no-op, not an error", async () => {
    giftsMock.getGiftForAdmin.mockResolvedValue(fakeGift({ status: "SUSPENDED", prevStatus: "ACTIVE" }));

    await expect(suspendGift("gift_1", "mod_1")).resolves.toMatchObject({ status: "SUSPENDED" });
    expect(giftsMock.setGiftStatusForAdmin).not.toHaveBeenCalled();
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it("passes report context through to the audit log", async () => {
    giftsMock.getGiftForAdmin.mockResolvedValue(fakeGift({ status: "DRAFT" }));
    giftsMock.setGiftStatusForAdmin.mockResolvedValue(fakeGift({ status: "SUSPENDED", prevStatus: "DRAFT" }));

    await suspendGift("gift_1", "mod_1", { reportId: "report_1" });

    const auditData = prismaMock.auditLog.create.mock.calls[0]![0].data;
    expect(auditData.meta).toMatchObject({ reportId: "report_1", prevStatus: "DRAFT" });
  });
});

describe("unsuspendGift", () => {
  it("restores the gift to its prevStatus and clears suspension fields", async () => {
    giftsMock.getGiftForAdmin.mockResolvedValue(
      fakeGift({ status: "SUSPENDED", prevStatus: "ACTIVE", suspendedAt: new Date() }),
    );
    giftsMock.setGiftStatusForAdmin.mockResolvedValue(fakeGift({ status: "ACTIVE" }));

    await unsuspendGift("gift_1", "mod_1");

    expect(giftsMock.setGiftStatusForAdmin).toHaveBeenCalledWith("gift_1", {
      status: "ACTIVE",
      prevStatus: null,
      suspendedAt: null,
    });
  });

  it("falls back to DRAFT if prevStatus was somehow never recorded", async () => {
    giftsMock.getGiftForAdmin.mockResolvedValue(fakeGift({ status: "SUSPENDED", prevStatus: null }));
    giftsMock.setGiftStatusForAdmin.mockResolvedValue(fakeGift({ status: "DRAFT" }));

    await unsuspendGift("gift_1", "mod_1");

    expect(giftsMock.setGiftStatusForAdmin).toHaveBeenCalledWith(
      "gift_1",
      expect.objectContaining({ status: "DRAFT" }),
    );
  });

  it("rejects unsuspending a gift that isn't suspended", async () => {
    giftsMock.getGiftForAdmin.mockResolvedValue(fakeGift({ status: "ACTIVE" }));

    await expect(unsuspendGift("gift_1", "mod_1")).rejects.toBeInstanceOf(ConflictError);
    expect(giftsMock.setGiftStatusForAdmin).not.toHaveBeenCalled();
  });
});
