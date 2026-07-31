import type { CourtParty, CourtTrial } from "./types";

/** The other party in a trial, from the current user's point of view. */
export function getOpponent(trial: CourtTrial, currentUserId: string): CourtParty {
  return trial.initiator.id === currentUserId ? trial.target : trial.initiator;
}

export function isInitiator(trial: CourtTrial, currentUserId: string): boolean {
  return trial.initiator.id === currentUserId;
}

/**
 * Human, personalized verdict line from the current user's perspective —
 * pure and unit-testable on purpose (reused by CourtTrialCard's list view
 * and the Verdict card). Returns "" for an unresolved trial rather than
 * throwing, so a careless call site fails quietly instead of crashing a
 * render.
 */
export function describeVerdict(trial: CourtTrial, currentUserId: string): string {
  if (!trial.verdict) return "";
  if (trial.verdict === "tie") return "Hoà — cả hai đều vô tri như nhau.";

  const iAmInitiator = isInitiator(trial, currentUserId);
  const winnerIsMe = (trial.verdict === "initiator") === iAmInitiator;
  const opponentName = getOpponent(trial, currentUserId).name;

  return winnerIsMe ? `Bạn thắng! ${opponentName} vô tri hơn.` : `${opponentName} thắng! Bạn vô tri hơn.`;
}
