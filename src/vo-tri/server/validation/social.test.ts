import { describe, expect, it } from "vitest";
import { postCommentSchema, reactSchema } from "./social";

describe("reactSchema", () => {
  it("accepts a valid reaction", () => {
    const result = reactSchema.safeParse({
      targetType: "feed_item",
      targetId: "123e4567-e89b-12d3-a456-426614174000",
      reactionId: "vo-tri",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a reaction id outside the real 5-reaction set", () => {
    const result = reactSchema.safeParse({
      targetType: "feed_item",
      targetId: "123e4567-e89b-12d3-a456-426614174000",
      reactionId: "haha",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid targetId", () => {
    const result = reactSchema.safeParse({ targetType: "comment", targetId: "not-a-uuid", reactionId: "thich" });
    expect(result.success).toBe(false);
  });
});

describe("postCommentSchema", () => {
  it("accepts a valid comment", () => {
    const result = postCommentSchema.safeParse({ targetType: "activity", targetId: "diem-danh", body: "Hay đấy!" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty body", () => {
    const result = postCommentSchema.safeParse({ targetType: "activity", targetId: "diem-danh", body: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a body longer than 1000 chars (matches the DB check constraint)", () => {
    const result = postCommentSchema.safeParse({ targetType: "activity", targetId: "diem-danh", body: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });
});
