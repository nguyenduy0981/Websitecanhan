import { describe, expect, it } from "vitest";
import { fail, mapSupabaseError, ok, validationFail } from "./errors";

describe("ok/fail", () => {
  it("ok wraps data with ok: true", () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
  });

  it("fail maps a known code to its brand-voice copy", () => {
    const result = fail("QUEST_ALREADY_CLAIMED");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("QUEST_ALREADY_CLAIMED");
      expect(result.error.title).toBe("Nhận rồi mà!");
    }
  });

  it("fail falls back to errorCopy.generic for an unknown code", () => {
    const result = fail("SOMETHING_WEIRD");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.title).toBe("Ơ, có gì đó vừa vỡ...");
    }
  });
});

describe("error taxonomy (category)", () => {
  it.each([
    ["NOT_AUTHENTICATED", "authentication"],
    ["DAILY_LIMIT_EXCEEDED", "rate_limit"],
    ["COOLDOWN_ACTIVE", "rate_limit"],
    ["QUEST_NOT_COMPLETE", "business_rule_violation"],
    ["QUEST_ALREADY_CLAIMED", "conflict"],
    ["MILESTONE_NOT_REACHED", "business_rule_violation"],
    ["MILESTONE_ALREADY_CLAIMED", "conflict"],
    ["CANNOT_FOLLOW_SELF", "business_rule_violation"],
    ["UNKNOWN_ACTIVITY", "not_found"],
    ["UNKNOWN_QUEST", "not_found"],
    ["UNKNOWN_MILESTONE", "not_found"],
  ] as const)("fail(%s) categorizes as %s", (code, category) => {
    const result = fail(code);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.category).toBe(category);
  });

  it("fail categorizes an unrecognized code as unexpected_failure", () => {
    const result = fail("SOMETHING_WEIRD");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.category).toBe("unexpected_failure");
  });

  it("validationFail always categorizes as validation", () => {
    const result = validationFail("Mật khẩu cần ít nhất 8 ký tự.");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.category).toBe("validation");
      expect(result.error.description).toBe("Mật khẩu cần ít nhất 8 ký tự.");
    }
  });

  it("mapSupabaseError categorizes a recognized business-rule code correctly, not as infra", () => {
    const result = mapSupabaseError({ message: "... DAILY_LIMIT_EXCEEDED ..." });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.category).toBe("rate_limit");
  });

  it("mapSupabaseError categorizes an unrecognized message as infrastructure_failure", () => {
    const result = mapSupabaseError({ message: "connection timeout" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.category).toBe("infrastructure_failure");
  });
});

describe("mapSupabaseError", () => {
  it("matches a known code embedded in a raw Postgres error message", () => {
    const result = mapSupabaseError({ message: 'new row violates... DAILY_LIMIT_EXCEEDED context blah' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("DAILY_LIMIT_EXCEEDED");
    }
  });

  it("falls back to generic for an unrecognized message (real infra error, not a business rule)", () => {
    const result = mapSupabaseError({ message: "connection timeout" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("generic");
    }
  });
});
