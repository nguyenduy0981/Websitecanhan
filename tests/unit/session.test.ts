import { describe, expect, it } from "vitest";
import { generateToken, hashToken } from "@/modules/auth/session";

describe("session tokens", () => {
  it("generates unique, sufficiently long random tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });

  it("hashes deterministically, so the same token always looks up the same row", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashToken(generateToken())).not.toBe(hashToken(generateToken()));
  });

  it("never stores the raw token as its own hash", () => {
    const token = generateToken();
    expect(hashToken(token)).not.toBe(token);
  });
});
