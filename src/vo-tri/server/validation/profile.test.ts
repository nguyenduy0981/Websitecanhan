import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "./profile";

describe("updateProfileSchema", () => {
  it("accepts a valid displayName + tagline", () => {
    const result = updateProfileSchema.safeParse({ displayName: "Bé Vô Tri", tagline: "Chuyên gia vô nghĩa" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty displayName", () => {
    const result = updateProfileSchema.safeParse({ displayName: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects displayName longer than 24 chars (matches EditProfileSheet's NAME_MAX)", () => {
    const result = updateProfileSchema.safeParse({ displayName: "a".repeat(25) });
    expect(result.success).toBe(false);
  });

  it("accepts displayName at exactly 24 chars", () => {
    const result = updateProfileSchema.safeParse({ displayName: "a".repeat(24) });
    expect(result.success).toBe(true);
  });

  it("rejects tagline longer than 60 chars (matches EditProfileSheet's TAGLINE_MAX)", () => {
    const result = updateProfileSchema.safeParse({ displayName: "X", tagline: "a".repeat(61) });
    expect(result.success).toBe(false);
  });

  it("defaults tagline to empty string when omitted", () => {
    const result = updateProfileSchema.parse({ displayName: "X" });
    expect(result.tagline).toBe("");
  });
});
