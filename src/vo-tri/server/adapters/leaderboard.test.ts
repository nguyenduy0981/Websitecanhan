import { describe, expect, it } from "vitest";
import { toLeaderboardPlayer, toMyPosition } from "./leaderboard";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const profileRow = {
  id: "u1",
  display_name: "Bé Vô Tri",
  avatar_url: null,
  level: 12,
  points: 500,
} as ProfileRow;

describe("toLeaderboardPlayer", () => {
  it("maps rank + profile fields and derives badgeLabel from level via getRank", () => {
    const result = toLeaderboardPlayer(profileRow, 1, undefined);
    expect(result.id).toBe("u1");
    expect(result.rank).toBe(1);
    expect(result.previousRank).toBeUndefined();
    expect(result.name).toBe("Bé Vô Tri");
    expect(result.points).toBe(500);
    expect(result.badgeLabel).toBe("Cao Thủ"); // level 12 -> Cao Thủ per ranks.ts
  });

  it("carries previousRank through when supplied", () => {
    expect(toLeaderboardPlayer(profileRow, 3, 5).previousRank).toBe(5);
  });
});

describe("toMyPosition", () => {
  it("computes gapToNext from the next-higher player's points", () => {
    expect(toMyPosition(5, 100, 130)).toEqual({ rank: 5, points: 100, gapToNext: 30 });
  });

  it("clamps gapToNext to 0 when already at or above the next rank (rank 1, no one above)", () => {
    expect(toMyPosition(1, 500, undefined)).toEqual({ rank: 1, points: 500, gapToNext: 0 });
  });
});
