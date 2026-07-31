import type { SupabaseClient } from "@supabase/supabase-js";
import { toCourtTrial, toConsensusResult } from "@/vo-tri/server/adapters/court";
import { fail, mapSupabaseError, ok, validationFail, type ServiceResult } from "@/vo-tri/server/errors";
import {
  getDilemmaConsensus as getDilemmaConsensusRpc,
  getMyVoteToday as getMyVoteTodayRow,
  listAnswersForTrials,
  listMyTrials as listMyTrialsRows,
  startCourtTrial as startCourtTrialRpc,
  submitCourtAnswer as submitCourtAnswerRpc,
  voteDilemma as voteDilemmaRpc,
} from "@/vo-tri/server/repositories/court-repository";
import { toDateOnlyString } from "@/vo-tri/lib/time";
import {
  startCourtTrialSchema,
  submitCourtAnswerSchema,
  voteDilemmaSchema,
  type StartCourtTrialInput,
  type SubmitCourtAnswerInput,
  type VoteDilemmaInput,
} from "@/vo-tri/server/validation/court";
import type { Database } from "@/vo-tri/server/supabase/database.types";
import type { ConsensusResult, CourtTrial, DilemmaChoice, VoteResult } from "@/vo-tri/court/types";

type Client = SupabaseClient<Database>;

export async function voteDilemma(client: Client, input: VoteDilemmaInput): Promise<ServiceResult<VoteResult>> {
  const parsed = voteDilemmaSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await voteDilemmaRpc(client, parsed.data.dilemmaId, parsed.data.choice);
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");

  return ok({
    points: data.awarded_points,
    xp: data.awarded_xp,
    leveledUp: data.leveled_up ? { newLevel: data.new_level } : undefined,
  });
}

/** Today's real aggregate consensus for one dilemma, plus the caller's own vote if they've made one — `userId` absent (logged out) skips the private "my vote" lookup and returns the aggregate alone. */
export async function getTodayConsensus(client: Client, dilemmaId: string, userId: string | null): Promise<ServiceResult<ConsensusResult>> {
  const periodKey = toDateOnlyString(new Date());

  const [{ data: consensusRows, error: consensusError }, myVote] = await Promise.all([
    getDilemmaConsensusRpc(client, dilemmaId, periodKey),
    userId ? getMyVoteTodayRow(client, userId, periodKey) : Promise.resolve({ data: null, error: null }),
  ]);
  if (consensusError) return mapSupabaseError(consensusError);
  if (myVote.error) return mapSupabaseError(myVote.error);

  const myChoice: DilemmaChoice | undefined = myVote.data?.dilemma_id === dilemmaId ? myVote.data.choice : undefined;
  return ok(toConsensusResult(dilemmaId, consensusRows ?? [], myChoice));
}

export async function startCourtTrial(client: Client, input: StartCourtTrialInput): Promise<ServiceResult<{ trialId: string }>> {
  const parsed = startCourtTrialSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await startCourtTrialRpc(client, parsed.data.targetId, parsed.data.dilemmaId);
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");
  return ok({ trialId: data });
}

export async function submitCourtAnswer(
  client: Client,
  input: SubmitCourtAnswerInput,
): Promise<ServiceResult<{ status: "pending" | "resolved"; verdict?: "initiator" | "target" | "tie" }>> {
  const parsed = submitCourtAnswerSchema.safeParse(input);
  if (!parsed.success) return validationFail(parsed.error.issues[0]!.message);

  const { data, error } = await submitCourtAnswerRpc(client, parsed.data.trialId, parsed.data.choice);
  if (error) return mapSupabaseError(error);
  if (!data) return fail("generic");

  return ok({ status: data.status, verdict: data.verdict ?? undefined });
}

/** Every trial the user is a party to. Two queries total (trials, then a batched `.in()` answers lookup) — not N+1 — see listAnswersForTrials's comment. */
export async function listMyTrials(client: Client, userId: string): Promise<ServiceResult<CourtTrial[]>> {
  const { data, error } = await listMyTrialsRows(client, userId);
  if (error) return mapSupabaseError(error);
  const rows = data ?? [];
  if (rows.length === 0) return ok([]);

  const { data: answerRows, error: answersError } = await listAnswersForTrials(
    client,
    rows.map((row) => row.id),
  );
  if (answersError) return mapSupabaseError(answersError);

  const answersByTrial = new Map<string, { user_id: string; choice: DilemmaChoice }[]>();
  for (const answer of answerRows ?? []) {
    const list = answersByTrial.get(answer.trial_id) ?? [];
    list.push({ user_id: answer.user_id, choice: answer.choice });
    answersByTrial.set(answer.trial_id, list);
  }

  return ok(rows.map((row) => toCourtTrial(row, userId, answersByTrial.get(row.id) ?? [])));
}
