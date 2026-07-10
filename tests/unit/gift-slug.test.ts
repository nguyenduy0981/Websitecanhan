import { describe, expect, it } from "vitest";
import { generateSlug } from "@/modules/gifts/slug";

describe("generateSlug", () => {
  it("produces a URL-safe, unguessable-length slug", () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(slug.length).toBeGreaterThanOrEqual(10);
  });

  it("produces different slugs on each call", () => {
    const slugs = new Set(Array.from({ length: 20 }, () => generateSlug()));
    expect(slugs.size).toBe(20);
  });
});
