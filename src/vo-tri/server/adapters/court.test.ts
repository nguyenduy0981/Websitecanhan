import { describe, expect, it } from "vitest";
import { toConsensusResult, toCourtTrial } from "./court";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type DilemmaRow = Database["public"]["Tables"]["dilemmas"]["Row"];
type CourtTrialRow = Database["public"]["Tables"]["court_trials"]["Row"];

const initiator = { id: "u1", display_name: "Alice", avatar_url: null } as ProfileRow;
const target = { id: "u2", display_name: "Bob", avatar_url: null } as ProfileRow;
const dilemma = { id: "d1", prompt: "P?", option_a: "A", option_b: "B" } as DilemmaRow;

const trialRow = {
  id: "t1",
  initiator_id: "u1",
  target_id: "u2",
  dilemma_id: "d1",
  status: "resolved",
  verdict: "initiator",
  created_at: "2026-07-31T00:00:00.000Z",
  expires_at: "2026-08-01T00:00:00.000Z",
} as CourtTrialRow;

describe("toCourtTrial", () => {
  it("maps my own answer and the other party's answer once resolved", () => {
    const result = toCourtTrial(
      { ...trialRow, initiator, target, dilemma },
      "u1",
      [
        { user_id: "u1", choice: "b" },
        { user_id: "u2", choice: "a" },
      ],
    );

    expect(result.myChoice).toBe("b");
    expect(result.otherChoice).toBe("a");
    expect(result.verdict).toBe("initiator");
    expect(result.initiator).toEqual({ id: "u1", name: "Alice", avatarUrl: undefined });
    expect(result.target).toEqual({ id: "u2", name: "Bob", avatarUrl: undefined });
  });

  it("leaves both choices undefined when nobody has answered yet", () => {
    const pending = { ...trialRow, status: "pending" as const, verdict: null };
    const result = toCourtTrial({ ...pending, initiator, target, dilemma }, "u1", []);
    expect(result.myChoice).toBeUndefined();
    expect(result.otherChoice).toBeUndefined();
    expect(result.verdict).toBeUndefined();
  });
});

describe("toConsensusResult", () => {
  it("maps grouped counts and preserves the caller's own choice", () => {
    const result = toConsensusResult(
      "d1",
      [
        { choice: "a", vote_count: 3 },
        { choice: "b", vote_count: 5 },
      ],
      "a",
    );
    expect(result).toEqual({ dilemmaId: "d1", choiceACount: 3, choiceBCount: 5, myChoice: "a" });
  });

  it("defaults missing choices to 0 and myChoice to undefined", () => {
    const result = toConsensusResult("d1", []);
    expect(result).toEqual({ dilemmaId: "d1", choiceACount: 0, choiceBCount: 0, myChoice: undefined });
  });
});
