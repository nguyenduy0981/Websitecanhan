import { describe, expect, it } from "vitest";
import { getMilestonesForMetric, milestones } from "./milestones";

describe("getMilestonesForMetric", () => {
  it("only returns milestones for the requested metric", () => {
    const streakOnes = getMilestonesForMetric("streak");
    expect(streakOnes.length).toBeGreaterThan(0);
    expect(streakOnes.every((m) => m.metric === "streak")).toBe(true);
  });

  it("returns milestones sorted ascending by threshold", () => {
    const played = getMilestonesForMetric("activitiesPlayed");
    const thresholds = played.map((m) => m.threshold);
    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b));
  });

  it("covers every milestone in the catalog across the two metrics", () => {
    const total = getMilestonesForMetric("streak").length + getMilestonesForMetric("activitiesPlayed").length;
    expect(total).toBe(milestones.length);
  });
});
