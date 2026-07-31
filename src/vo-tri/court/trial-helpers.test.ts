import { describe, expect, it } from "vitest";
import { describeVerdict, getOpponent, isInitiator } from "./trial-helpers";
import type { CourtTrial } from "./types";

const baseTrial: CourtTrial = {
  id: "t1",
  dilemma: { id: "d1", prompt: "P?", optionA: "A", optionB: "B" },
  initiator: { id: "u1", name: "Alice" },
  target: { id: "u2", name: "Bob" },
  status: "pending",
  createdAt: new Date("2026-07-31T00:00:00.000Z"),
  expiresAt: new Date("2026-08-01T00:00:00.000Z"),
};

describe("getOpponent", () => {
  it("returns the target when the current user is the initiator", () => {
    expect(getOpponent(baseTrial, "u1")).toEqual(baseTrial.target);
  });

  it("returns the initiator when the current user is the target", () => {
    expect(getOpponent(baseTrial, "u2")).toEqual(baseTrial.initiator);
  });
});

describe("isInitiator", () => {
  it("is true only for the initiator's id", () => {
    expect(isInitiator(baseTrial, "u1")).toBe(true);
    expect(isInitiator(baseTrial, "u2")).toBe(false);
  });
});

describe("describeVerdict", () => {
  it("returns an empty string for an unresolved trial", () => {
    expect(describeVerdict(baseTrial, "u1")).toBe("");
  });

  it("describes a tie the same way for both parties", () => {
    const tied: CourtTrial = { ...baseTrial, status: "resolved", verdict: "tie" };
    expect(describeVerdict(tied, "u1")).toBe("Hoà — cả hai đều vô tri như nhau.");
    expect(describeVerdict(tied, "u2")).toBe("Hoà — cả hai đều vô tri như nhau.");
  });

  it("tells the initiator they won when the verdict favors the initiator", () => {
    const resolved: CourtTrial = { ...baseTrial, status: "resolved", verdict: "initiator" };
    expect(describeVerdict(resolved, "u1")).toBe("Bạn thắng! Bob vô tri hơn.");
    expect(describeVerdict(resolved, "u2")).toBe("Alice thắng! Bạn vô tri hơn.");
  });

  it("tells the target they won when the verdict favors the target", () => {
    const resolved: CourtTrial = { ...baseTrial, status: "resolved", verdict: "target" };
    expect(describeVerdict(resolved, "u1")).toBe("Bob thắng! Bạn vô tri hơn.");
    expect(describeVerdict(resolved, "u2")).toBe("Bạn thắng! Alice vô tri hơn.");
  });
});
