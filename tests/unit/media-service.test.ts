import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, storageMock, processingMock } = vi.hoisted(() => ({
  prismaMock: {
    mediaAsset: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
  storageMock: {
    putObject: vi.fn(),
    deleteObject: vi.fn(),
    publicUrlFor: vi.fn((key: string) => `https://cdn.example.com/${key}`),
  },
  processingMock: {
    validateAndProcessImage: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/modules/media/storage", () => storageMock);
vi.mock("@/modules/media/image-processing", () => processingMock);

const {
  uploadImageForGift,
  assertMediaOwned,
  assertMediaListOwned,
  deleteMediaAsset,
  getMediaUrlsByIds,
} = await import("@/modules/media/service");
const { NotFoundError, ValidationError } = await import("@/lib/errors");

beforeEach(() => {
  vi.clearAllMocks();
  storageMock.publicUrlFor.mockImplementation((key: string) => `https://cdn.example.com/${key}`);
});

describe("uploadImageForGift", () => {
  it("rejects once the gift is at its plan's image quota", async () => {
    prismaMock.mediaAsset.count.mockResolvedValue(5);
    await expect(
      uploadImageForGift("user_1", "gift_1", "FREE", Buffer.from("x")),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(processingMock.validateAndProcessImage).not.toHaveBeenCalled();
  });

  it("allows more images for VIP than FREE", async () => {
    prismaMock.mediaAsset.count.mockResolvedValue(10);
    // 10 is under the VIP limit (20) but over FREE (5)
    processingMock.validateAndProcessImage.mockResolvedValue({
      buffer: Buffer.from("processed"),
      width: 100,
      height: 100,
      mimeType: "image/webp",
    });
    prismaMock.mediaAsset.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "asset_1",
      ...data,
    }));

    const result = await uploadImageForGift("user_1", "gift_1", "VIP", Buffer.from("x"));
    expect(result.id).toBe("asset_1");
    expect(storageMock.putObject).toHaveBeenCalledTimes(1);
  });

  it("uploads, stores, and returns a servable URL for a valid image", async () => {
    prismaMock.mediaAsset.count.mockResolvedValue(0);
    processingMock.validateAndProcessImage.mockResolvedValue({
      buffer: Buffer.from("processed-bytes"),
      width: 800,
      height: 600,
      mimeType: "image/webp",
    });
    prismaMock.mediaAsset.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "asset_1",
      ...data,
    }));

    const result = await uploadImageForGift("user_1", "gift_1", "FREE", Buffer.from("raw"));

    expect(result).toEqual({
      id: "asset_1",
      url: expect.stringContaining("https://cdn.example.com/gifts/gift_1/"),
      width: 800,
      height: 600,
    });
    const createdData = prismaMock.mediaAsset.create.mock.calls[0]![0].data;
    expect(createdData.ownerId).toBe("user_1");
    expect(createdData.giftId).toBe("gift_1");
    expect(createdData.status).toBe("READY");
  });
});

describe("assertMediaOwned / assertMediaListOwned", () => {
  it("throws NotFoundError when the asset doesn't exist or isn't owned", async () => {
    prismaMock.mediaAsset.findUnique.mockResolvedValue(null);
    await expect(assertMediaOwned("asset_1", "user_1")).rejects.toBeInstanceOf(NotFoundError);

    prismaMock.mediaAsset.findUnique.mockResolvedValue({ id: "asset_1", ownerId: "someone_else" });
    await expect(assertMediaOwned("asset_1", "user_1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("resolves when the asset is owned by the caller", async () => {
    prismaMock.mediaAsset.findUnique.mockResolvedValue({ id: "asset_1", ownerId: "user_1" });
    await expect(assertMediaOwned("asset_1", "user_1")).resolves.toBeUndefined();
  });

  it("rejects a GALLERY list if any id isn't owned by the caller", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([{ id: "a" }]); // only 1 of 2 found
    await expect(assertMediaListOwned(["a", "b"], "user_1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("resolves when every id in the list is owned", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([{ id: "a" }, { id: "b" }]);
    await expect(assertMediaListOwned(["a", "b"], "user_1")).resolves.toBeUndefined();
  });
});

describe("deleteMediaAsset", () => {
  it("deletes the storage object and the DB row", async () => {
    prismaMock.mediaAsset.findUnique.mockResolvedValue({
      id: "asset_1",
      ownerId: "user_1",
      storageKey: "gifts/gift_1/abc.webp",
    });
    prismaMock.mediaAsset.delete.mockResolvedValue({});

    await deleteMediaAsset("asset_1", "user_1");

    expect(storageMock.deleteObject).toHaveBeenCalledWith("gifts/gift_1/abc.webp");
    expect(prismaMock.mediaAsset.delete).toHaveBeenCalledWith({ where: { id: "asset_1" } });
  });

  it("still deletes the DB row even if the storage delete fails (best-effort)", async () => {
    prismaMock.mediaAsset.findUnique.mockResolvedValue({
      id: "asset_1",
      ownerId: "user_1",
      storageKey: "gifts/gift_1/abc.webp",
    });
    storageMock.deleteObject.mockRejectedValue(new Error("network error"));
    prismaMock.mediaAsset.delete.mockResolvedValue({});

    await expect(deleteMediaAsset("asset_1", "user_1")).resolves.toBeUndefined();
    expect(prismaMock.mediaAsset.delete).toHaveBeenCalledTimes(1);
  });

  it("refuses to delete an asset owned by someone else", async () => {
    prismaMock.mediaAsset.findUnique.mockResolvedValue({ id: "asset_1", ownerId: "someone_else" });
    await expect(deleteMediaAsset("asset_1", "user_1")).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMock.mediaAsset.delete).not.toHaveBeenCalled();
  });
});

describe("getMediaUrlsByIds", () => {
  it("returns an empty map for an empty input", async () => {
    expect(await getMediaUrlsByIds([])).toEqual({});
    expect(prismaMock.mediaAsset.findMany).not.toHaveBeenCalled();
  });

  it("maps each found id to its public URL", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([
      { id: "a", storageKey: "gifts/x/a.webp" },
      { id: "b", storageKey: "gifts/x/b.webp" },
    ]);
    const result = await getMediaUrlsByIds(["a", "b"]);
    expect(result.a).toBe("https://cdn.example.com/gifts/x/a.webp");
    expect(result.b).toBe("https://cdn.example.com/gifts/x/b.webp");
  });

  it("silently omits ids it can't resolve a URL for (e.g. storage not configured)", async () => {
    prismaMock.mediaAsset.findMany.mockResolvedValue([{ id: "a", storageKey: "gifts/x/a.webp" }]);
    storageMock.publicUrlFor.mockImplementation(() => {
      throw new Error("R2 not configured");
    });
    await expect(getMediaUrlsByIds(["a"])).resolves.toEqual({});
  });
});
