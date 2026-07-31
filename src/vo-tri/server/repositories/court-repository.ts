import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/vo-tri/server/supabase/database.types";

type Client = SupabaseClient<Database>;
type DilemmaChoice = Database["public"]["Tables"]["dilemma_votes"]["Row"]["choice"];

export function voteDilemma(client: Client, dilemmaId: string, choice: DilemmaChoice) {
  return client.rpc("vote_dilemma", { p_dilemma_id: dilemmaId, p_choice: choice }).single();
}

export function getDilemmaConsensus(client: Client, dilemmaId: string, periodKey: string) {
  return client.rpc("get_dilemma_consensus", { p_dilemma_id: dilemmaId, p_period_key: periodKey });
}

/** The current user's own vote today, if any — private row (RLS: select-own-row-only), see 20260724000014_court.sql. */
export function getMyVoteToday(client: Client, userId: string, periodKey: string) {
  return client.from("dilemma_votes").select("dilemma_id, choice").eq("user_id", userId).eq("period_key", periodKey).maybeSingle();
}

export function startCourtTrial(client: Client, targetId: string, dilemmaId: string) {
  return client.rpc("start_court_trial", { p_target_id: targetId, p_dilemma_id: dilemmaId });
}

export function submitCourtAnswer(client: Client, trialId: string, choice: DilemmaChoice) {
  return client.rpc("submit_court_answer", { p_trial_id: trialId, p_choice: choice }).single();
}

/** Every trial the user is a party to (either side), newest first — court_trials' own SELECT policy already scopes this to the caller's trials, `.or(...)` here just matches that same condition so the query only asks for rows RLS would return anyway. */
export function listMyTrials(client: Client, userId: string) {
  return client
    .from("court_trials")
    .select(
      "*, dilemma:dilemmas(*), initiator:profiles!court_trials_initiator_id_fkey(*), target:profiles!court_trials_target_id_fkey(*)",
    )
    .or(`initiator_id.eq.${userId},target_id.eq.${userId}`)
    .order("created_at", { ascending: false });
}

/** Both sides' answers across a batch of trials in one query (not N+1) — used to fill in myChoice/otherChoice for `listMyTrials`'s resolved trials. RLS only reveals the other party's row once a trial is resolved (see the court_answers SELECT policy), so an unresolved trial's own answer row is the only one it can ever return here. */
export function listAnswersForTrials(client: Client, trialIds: string[]) {
  return client.from("court_answers").select("trial_id, user_id, choice").in("trial_id", trialIds);
}
