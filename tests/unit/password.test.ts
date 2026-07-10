import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/auth/password";

describe("password hashing", () => {
  it("hashes and verifies the correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toContain("correct horse battery staple");
    await expect(verifyPassword(hash, "correct horse battery staple")).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });

  it("produces an argon2id hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("never throws on a malformed hash, just returns false", async () => {
    await expect(verifyPassword("not-a-real-hash", "anything")).resolves.toBe(false);
  });
});
