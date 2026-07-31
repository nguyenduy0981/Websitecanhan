import { Flame } from "lucide-react";
import { describe, expect, it } from "vitest";
import { currentValueForMetric, toMilestoneProgress } from "./milestone";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { MilestoneDefinition } from "@/vo-tri/retention/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MilestoneProgressRow = Database["public"]["Tables"]["milestone_progress"]["Row"];

const profileRow = { current_streak: 5, total_activities_played: 42 } as ProfileRow;

const streakMilestone: MilestoneDefinition = {
  id: "streak-3",
  title: "Khởi Động",
  description: "Chuỗi 3 ngày liên tiếp",
  metric: "streak",
  threshold: 3,
  icon: Flame,
};

describe("currentValueForMetric", () => {
  it("reads current_streak for the streak metric", () => {
    expect(currentValueForMetric(profileRow, "streak")).toBe(5);
  });

  it("reads total_activities_played for the activitiesPlayed metric", () => {
    expect(currentValueForMetric(profileRow, "activitiesPlayed")).toBe(42);
  });
});

describe("toMilestoneProgress", () => {
  it("reflects the live profile counter even with no progress row yet", () => {
    const result = toMilestoneProgress(profileRow, streakMilestone, undefined);
    expect(result).toEqual({ milestoneId: "streak-3", current: 5, reachedAt: undefined });
  });

  it("includes reachedAt when a progress row exists", () => {
    const progressRow: MilestoneProgressRow = {
      user_id: "u1",
      milestone_id: "streak-3",
      reached_at: "2026-07-20T00:00:00.000Z",
      claimed_at: null,
    };
    const result = toMilestoneProgress(profileRow, streakMilestone, progressRow);
    expect(result.reachedAt).toEqual(new Date("2026-07-20T00:00:00.000Z"));
  });
});
