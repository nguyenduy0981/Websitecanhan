import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { ConsensusResult, CourtParty, CourtTrial, DilemmaChoice } from "@/vo-tri/court/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type DilemmaRow = Database["public"]["Tables"]["dilemmas"]["Row"];
type CourtTrialRow = Database["public"]["Tables"]["court_trials"]["Row"];
type AnswerRow = { user_id: string; choice: DilemmaChoice };

function toCourtParty(row: ProfileRow): CourtParty {
  return { id: row.id, name: row.display_name, avatarUrl: row.avatar_url ?? undefined };
}

export function toCourtTrial(
  row: CourtTrialRow & { dilemma: DilemmaRow; initiator: ProfileRow; target: ProfileRow },
  currentUserId: string,
  answers: AnswerRow[],
): CourtTrial {
  const mine = answers.find((a) => a.user_id === currentUserId);
  const other = answers.find((a) => a.user_id !== currentUserId);

  return {
    id: row.id,
    dilemma: { id: row.dilemma.id, prompt: row.dilemma.prompt, optionA: row.dilemma.option_a, optionB: row.dilemma.option_b },
    initiator: toCourtParty(row.initiator),
    target: toCourtParty(row.target),
    status: row.status,
    verdict: row.verdict ?? undefined,
    myChoice: mine?.choice,
    otherChoice: other?.choice,
    createdAt: new Date(row.created_at),
    expiresAt: new Date(row.expires_at),
  };
}

export function toConsensusResult(
  dilemmaId: string,
  rows: { choice: DilemmaChoice; vote_count: number }[],
  myChoice?: DilemmaChoice,
): ConsensusResult {
  const choiceACount = rows.find((r) => r.choice === "a")?.vote_count ?? 0;
  const choiceBCount = rows.find((r) => r.choice === "b")?.vote_count ?? 0;
  return { dilemmaId, choiceACount, choiceBCount, myChoice };
}
