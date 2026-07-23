import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins plain class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy conditional classes", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities by keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("lets a later className override an earlier conflicting one from a variant", () => {
    expect(cn("text-sm font-medium", "text-lg")).toBe("font-medium text-lg");
  });
});
