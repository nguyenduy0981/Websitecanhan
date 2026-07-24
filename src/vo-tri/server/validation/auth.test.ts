import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./auth";

describe("signUpSchema", () => {
  it("accepts valid signup input", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: "12345678",
      username: "be_vo_tri",
      displayName: "Bé Vô Tri",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password under 8 chars", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: "1234567",
      username: "be_vo_tri",
      displayName: "X",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a username with uppercase/special chars", () => {
    const result = signUpSchema.safeParse({
      email: "a@b.com",
      password: "12345678",
      username: "Bé-Vô-Tri!",
      displayName: "X",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "12345678",
      username: "be_vo_tri",
      displayName: "X",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts valid sign-in input", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "anything" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
