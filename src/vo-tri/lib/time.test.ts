import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeAgo } from "./time";

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("floors to 1 minute for anything under a minute old", () => {
    expect(timeAgo(new Date("2026-06-15T11:59:50Z"))).toBe("1 phút trước");
  });

  it("shows minutes under an hour", () => {
    expect(timeAgo(new Date("2026-06-15T11:45:00Z"))).toBe("15 phút trước");
  });

  it("shows hours under a day", () => {
    expect(timeAgo(new Date("2026-06-15T09:00:00Z"))).toBe("3 giờ trước");
  });

  it("shows days at 24 hours or more", () => {
    expect(timeAgo(new Date("2026-06-13T12:00:00Z"))).toBe("2 ngày trước");
  });
});
