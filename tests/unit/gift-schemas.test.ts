import { describe, expect, it } from "vitest";
import {
  createGiftSchema,
  createBlockSchema,
  reorderBlocksSchema,
  blockContentSchemas,
} from "@/modules/gifts/schemas";

describe("createGiftSchema", () => {
  it("requires a non-empty title and message", () => {
    expect(() => createGiftSchema.parse({ title: "", message: "hi" })).toThrow();
    expect(() => createGiftSchema.parse({ title: "Hi", message: "" })).toThrow();
  });

  it("accepts a valid gift", () => {
    const result = createGiftSchema.parse({ title: "Happy birthday", message: "Chúc mừng!" });
    expect(result.title).toBe("Happy birthday");
  });
});

describe("createBlockSchema (discriminated union)", () => {
  it("accepts a valid TEXT block", () => {
    const result = createBlockSchema.parse({ type: "TEXT", content: { text: "Hello" } });
    expect(result.type).toBe("TEXT");
  });

  it("rejects a TEXT block with IMAGE-shaped content", () => {
    expect(() =>
      createBlockSchema.parse({ type: "TEXT", content: { mediaAssetId: "abc" } }),
    ).toThrow();
  });

  it("accepts a valid GALLERY block with multiple items", () => {
    const result = createBlockSchema.parse({
      type: "GALLERY",
      content: { items: [{ mediaAssetId: "a" }, { mediaAssetId: "b", caption: "us" }] },
    });
    expect(result.type).toBe("GALLERY");
  });

  it("rejects an empty GALLERY items array", () => {
    expect(() =>
      createBlockSchema.parse({ type: "GALLERY", content: { items: [] } }),
    ).toThrow();
  });

  it("rejects an unknown block type", () => {
    expect(() => createBlockSchema.parse({ type: "VIDEO", content: {} })).toThrow();
  });
});

describe("blockContentSchemas lookup table", () => {
  it("has exactly one schema per GiftBlockType", () => {
    expect(Object.keys(blockContentSchemas).sort()).toEqual(["GALLERY", "IMAGE", "TEXT"]);
  });
});

describe("reorderBlocksSchema", () => {
  it("requires at least one id", () => {
    expect(() => reorderBlocksSchema.parse({ orderedBlockIds: [] })).toThrow();
  });

  it("accepts an ordered list of ids", () => {
    const result = reorderBlocksSchema.parse({ orderedBlockIds: ["a", "b", "c"] });
    expect(result.orderedBlockIds).toEqual(["a", "b", "c"]);
  });
});
