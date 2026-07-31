export type DilemmaChoice = "a" | "b";

/** A dilemma is real authored content (like Explore's activities.ts) — shared by Vô Tri Đồng Thuận's daily poll and Toà Án's trial content, per docs/VO_TRI_PRODUCT_BIBLE.md Part 1.3's documented merge: "one content catalog, two consumption surfaces." */
export interface Dilemma {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
}

/** Real aggregate vote counts for one dilemma on one day — absent (not zero/fabricated) until a real vote_dilemma() call exists to compute from. */
export interface ConsensusResult {
  dilemmaId: string;
  choiceACount: number;
  choiceBCount: number;
  /** The current user's own pick today, if any — drives the reveal-vs-vote UI split. */
  myChoice?: DilemmaChoice;
}

/** The result of a successful Vô Tri Đồng Thuận vote — same shape family as retention's ClaimResult, since voting is another small "you just earned this" moment. */
export interface VoteResult {
  points: number;
  xp: number;
  leveledUp?: { newLevel: number };
}

export type CourtTrialStatus = "pending" | "resolved";
export type CourtVerdict = "initiator" | "target" | "tie";

export interface CourtParty {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * One Toà Án Vô Tri trial between two real people over a shared dilemma —
 * async by design (see docs/VO_TRI_PRODUCT_BIBLE.md Part 2, Toà Án Vô Tri):
 * both sides answer independently within a window, the verdict renders
 * once both are in (or the window expires), order doesn't matter.
 */
export interface CourtTrial {
  id: string;
  dilemma: Dilemma;
  initiator: CourtParty;
  target: CourtParty;
  status: CourtTrialStatus;
  verdict?: CourtVerdict;
  /** Present once the current user has answered — safe to show any time, it's their own pick. */
  myChoice?: DilemmaChoice;
  /**
   * Present only once the trial is resolved — "blind" answering is a
   * server-enforced RLS property (see 20260724000014_court.sql's
   * court_answers SELECT policy: the other party's row is invisible while
   * `status = 'pending'`), not just a UI convention, so this type mirrors
   * exactly what a real query can ever return: never populated ahead of
   * `myChoice`, never populated before `status === "resolved"`.
   */
  otherChoice?: DilemmaChoice;
  createdAt: Date;
  expiresAt: Date;
}
