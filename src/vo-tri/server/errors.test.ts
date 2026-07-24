import { describe, expect, it } from "vitest";
import { fail, mapSupabaseError, ok } from "./errors";

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
