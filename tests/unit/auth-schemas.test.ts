import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema, resetPasswordSchema } from "@/modules/auth/schemas";

describe("registerSchema", () => {
  it("normalizes email to lowercase and trims whitespace", () => {
    const result = registerSchema.parse({
      email: "  User@Example.com  ",
      password: "correct horse battery staple",
    });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() => registerSchema.parse({ email: "a@b.com", password: "short1" })).toThrow();
  });

  it("rejects an invalid email", () => {
    expect(() => registerSchema.parse({ email: "not-an-email", password: "longenough1" })).toThrow();
  });

  it("accepts an optional displayName and rejects an empty one", () => {
    expect(() =>
      registerSchema.parse({ email: "a@b.com", password: "longenough1", displayName: "" }),
    ).toThrow();
    expect(
      registerSchema.parse({ email: "a@b.com", password: "longenough1", displayName: "Duy" })
        .displayName,
    ).toBe("Duy");
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(() => loginSchema.parse({ email: "a@b.com", password: "" })).toThrow();
  });
});

describe("resetPasswordSchema", () => {
  it("requires both a non-empty token and a valid new password", () => {
    expect(() => resetPasswordSchema.parse({ token: "", password: "longenough1" })).toThrow();
    expect(() => resetPasswordSchema.parse({ token: "abc", password: "short1" })).toThrow();
    expect(
      resetPasswordSchema.parse({ token: "abc", password: "longenough1" }),
    ).toEqual({ token: "abc", password: "longenough1" });
  });
});
