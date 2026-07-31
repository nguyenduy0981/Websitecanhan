import { describe, expect, it } from "vitest";
import { toQuestProgress } from "./quest";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type QuestProgressRow = Database["public"]["Tables"]["quest_progress"]["Row"];

describe("toQuestProgress", () => {
  it("maps an unclaimed quest", () => {
    const row: QuestProgressRow = {
      user_id: "u1",
      quest_id: "daily-check-in",
      period_key: "2026-07-24",
      current_value: 1,
      claimed_at: null,
      updated_at: "2026-07-24T00:00:00.000Z",
    };
    expect(toQuestProgress(row)).toEqual({ questId: "daily-check-in", current: 1, claimed: false });
  });

  it("maps a claimed quest (claimed_at present -> claimed: true)", () => {
    const row: QuestProgressRow = {
      user_id: "u1",
      quest_id: "daily-check-in",
      period_key: "2026-07-24",
      current_value: 1,
      claimed_at: "2026-07-24T01:00:00.000Z",
      updated_at: "2026-07-24T01:00:00.000Z",
    };
    expect(toQuestProgress(row).claimed).toBe(true);
  });
});
