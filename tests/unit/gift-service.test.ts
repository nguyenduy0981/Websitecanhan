import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

// Service-layer tests exercise real control flow (slug retry, status
// gating, expiry math) against a mocked Prisma client — no live Postgres
// is available in this environment. See tests/unit/auth-service.test.ts
// for the same rationale.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    gift: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    giftBlock: {
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/analytics", () => ({ recordAnalyticsEvent: vi.fn() }));

const { createGift, listGiftsForOwner, updateGift, deleteGift, publishGift } = await import(
  "@/modules/gifts/service"
);
const { getGiftForOwner } = await import("@/modules/gifts/authorization");
const { ConflictError, NotFoundError, ValidationError } = await import("@/lib/errors");

function fakeGift(overrides: Record<string, unknown> = {}) {
  return {
    id: "gift_1",
    slug: "abc123",
    ownerId: "user_1",
    status: "DRAFT",
    tier: "FREE",
    title: "Title",
    message: "Message",
    themeId: null,
    effectId: null,
    musicId: null,
    publishedAt: null,
    activeExpiresAt: null,
    recoveryEndsAt: null,
    deletedAt: null,
    suspendedAt: null,
    prevStatus: null,
    statusChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createGift", () => {
  it("creates a gift with a generated slug for the owner", async () => {
    prismaMock.gift.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
      fakeGift({ ...data }),
    );

    const gift = await createGift("user_1", { title: "Hi", message: "there" });

    expect(gift.ownerId).toBe("user_1");
    const createdData = prismaMock.gift.create.mock.calls[0]![0].data;
    expect(createdData.slug).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(createdData.slug.length).toBeGreaterThanOrEqual(10);
  });

  it("retries with a fresh slug on a unique-constraint collision, then succeeds", async () => {
    const collision = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "test",
    });
    prismaMock.gift.create
      .mockRejectedValueOnce(collision)
      .mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) =>
        fakeGift({ ...data }),
      );

    const gift = await createGift("user_1", { title: "Hi", message: "there" });
    expect(gift.ownerId).toBe("user_1");
    expect(prismaMock.gift.create).toHaveBeenCalledTimes(2);
  });

  it("does not swallow unrelated errors", async () => {
    prismaMock.gift.create.mockRejectedValue(new Error("connection lost"));
    await expect(createGift("user_1", { title: "Hi", message: "there" })).rejects.toThrow(
      "connection lost",
    );
  });
});

describe("listGiftsForOwner", () => {
  it("only queries gifts for the given owner", async () => {
    prismaMock.gift.findMany.mockResolvedValue([]);
    await listGiftsForOwner("user_1");
    expect(prismaMock.gift.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId: "user_1" } }),
    );
  });
});

describe("getGiftForOwner (IDOR protection)", () => {
  it("returns the gift when it belongs to the requesting user", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ ownerId: "user_1" }));
    const gift = await getGiftForOwner("gift_1", "user_1");
    expect(gift.id).toBe("gift_1");
  });

  it("throws NotFoundError (not Forbidden) when the gift belongs to someone else", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ ownerId: "someone_else" }));
    await expect(getGiftForOwner("gift_1", "user_1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws the same NotFoundError when the gift doesn't exist at all", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(null);
    await expect(getGiftForOwner("nope", "user_1")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("updateGift", () => {
  it("updates an editable (DRAFT) gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "DRAFT" }));
    prismaMock.gift.update.mockResolvedValue(fakeGift({ title: "New title" }));

    const gift = await updateGift("gift_1", "user_1", { title: "New title" });
    expect(gift.title).toBe("New title");
  });

  it("rejects editing a gift that is EXPIRED", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "EXPIRED" }));
    await expect(
      updateGift("gift_1", "user_1", { title: "New title" }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(prismaMock.gift.update).not.toHaveBeenCalled();
  });
});

describe("deleteGift", () => {
  it("deletes a DRAFT gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "DRAFT" }));
    prismaMock.gift.delete.mockResolvedValue({});
    await deleteGift("gift_1", "user_1");
    expect(prismaMock.gift.delete).toHaveBeenCalledWith({ where: { id: "gift_1" } });
  });

  it("refuses to delete a published (ACTIVE) gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "ACTIVE" }));
    await expect(deleteGift("gift_1", "user_1")).rejects.toBeInstanceOf(ConflictError);
    expect(prismaMock.gift.delete).not.toHaveBeenCalled();
  });
});

describe("publishGift", () => {
  it("rejects publishing a gift with zero blocks", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "DRAFT" }));
    prismaMock.giftBlock.count.mockResolvedValue(0);
    await expect(publishGift("gift_1", "user_1")).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects publishing a gift that isn't a DRAFT", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "ACTIVE" }));
    await expect(publishGift("gift_1", "user_1")).rejects.toBeInstanceOf(ConflictError);
  });

  it("sets ACTIVE + expiry exactly 3 days out for a FREE gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "DRAFT", tier: "FREE" }));
    prismaMock.giftBlock.count.mockResolvedValue(1);
    prismaMock.gift.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
      fakeGift({ ...data }),
    );

    const before = Date.now();
    const gift = await publishGift("gift_1", "user_1");
    const publishedAt = (gift.publishedAt as Date).getTime();
    const activeExpiresAt = (gift.activeExpiresAt as Date).getTime();

    expect(gift.status).toBe("ACTIVE");
    expect(publishedAt).toBeGreaterThanOrEqual(before);
    expect(activeExpiresAt - publishedAt).toBe(3 * 24 * 60 * 60 * 1000);
  });

  it("sets expiry exactly 15 days out for a VIP gift", async () => {
    prismaMock.gift.findUnique.mockResolvedValue(fakeGift({ status: "DRAFT", tier: "VIP" }));
    prismaMock.giftBlock.count.mockResolvedValue(1);
    prismaMock.gift.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
      fakeGift({ ...data }),
    );

    const gift = await publishGift("gift_1", "user_1");
    const publishedAt = (gift.publishedAt as Date).getTime();
    const activeExpiresAt = (gift.activeExpiresAt as Date).getTime();
    expect(activeExpiresAt - publishedAt).toBe(15 * 24 * 60 * 60 * 1000);
  });
});
