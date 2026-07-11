import { describe, expect, it } from "vitest";
import { classifyGiftForViewer } from "@/modules/gifts/public";
import { classifyDevice } from "@/lib/device";

describe("classifyGiftForViewer", () => {
  it("treats DRAFT identically to not found — unpublished content never leaks", () => {
    expect(classifyGiftForViewer("DRAFT")).toEqual({ type: "not_found" });
  });

  it("shows ACTIVE gifts", () => {
    expect(classifyGiftForViewer("ACTIVE")).toEqual({ type: "active" });
  });

  it("gives a friendly expired message, not the raw content", () => {
    const result = classifyGiftForViewer("EXPIRED");
    expect(result.type).toBe("unavailable");
  });

  it("never reveals the moderation reason for a SUSPENDED gift", () => {
    const result = classifyGiftForViewer("SUSPENDED");
    expect(result).toMatchObject({ type: "unavailable" });
    if (result.type === "unavailable") {
      expect(result.message.toLowerCase()).not.toContain("suspend");
      expect(result.message.toLowerCase()).not.toContain("vi phạm");
    }
  });

  it("treats RECOVERY / DELETION_PENDING / DELETED as gone", () => {
    for (const status of ["RECOVERY", "DELETION_PENDING", "DELETED"] as const) {
      expect(classifyGiftForViewer(status).type).toBe("unavailable");
    }
  });
});

describe("classifyDevice", () => {
  it("returns undefined when there's no user agent (never stores IP/PII either way)", () => {
    expect(classifyDevice(undefined)).toBeUndefined();
    expect(classifyDevice(null)).toBeUndefined();
  });

  it("classifies common mobile user agents", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (Linux; Android 14)")).toBe("mobile");
  });

  it("classifies tablets separately from phones", () => {
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
  });

  it("falls back to desktop for anything else", () => {
    expect(classifyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });
});
