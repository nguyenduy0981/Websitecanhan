import { errorCopy, serverErrorCopy, type ServerErrorCode } from "@/vo-tri/copy/microcopy";

/**
 * Unified error taxonomy — every error this backend can produce falls
 * into exactly one of these 9 buckets, regardless of which layer raised
 * it (a `security definer` SQL function, a zod schema, or a raw Supabase/
 * network failure). The point isn't UI copy (that's still `title`/
 * `description`, per-code) — it's giving callers (and future logging/
 * monitoring) one small, closed set of *kinds* of failure to switch on,
 * instead of pattern-matching on free-form `code` strings.
 *
 * - `authentication` — no session at all (`NOT_AUTHENTICATED`).
 * - `authorization` — a session exists but isn't allowed to do this. Not
 *   used by any code today: RLS enforces this by returning zero rows
 *   rather than a distinct error (see §17.2 of BACKEND_ARCHITECTURE.md
 *   for why that's a deliberate choice, not a gap) — the category exists
 *   so a real one has somewhere to go the day RLS isn't sufficient on
 *   its own (e.g. a moderation action needing a role check).
 * - `validation` — malformed input, caught before any DB call
 *   (`validationFail`).
 * - `not_found` — a referenced id doesn't exist (`UNKNOWN_ACTIVITY`,
 *   `UNKNOWN_QUEST`, `UNKNOWN_MILESTONE`).
 * - `conflict` — the request is well-formed but the target state already
 *   reflects it (`QUEST_ALREADY_CLAIMED`, `MILESTONE_ALREADY_CLAIMED`).
 * - `rate_limit` — a usage cap, not a one-time rule
 *   (`DAILY_LIMIT_EXCEEDED`, `COOLDOWN_ACTIVE`).
 * - `business_rule_violation` — a real game/product rule rejected the
 *   request (`QUEST_NOT_COMPLETE`, `MILESTONE_NOT_REACHED`,
 *   `CANNOT_FOLLOW_SELF`).
 * - `infrastructure_failure` — a real Postgres/network error we didn't
 *   recognize as one of the codes above (`mapSupabaseError`'s fallback).
 * - `unexpected_failure` — `fail()` called with a code that isn't in
 *   `serverErrorCopy` and isn't the known `mapSupabaseError` fallback
 *   path either; should be rare enough that seeing one in logs is itself
 *   the signal something needs a real code added.
 */
export type ServiceErrorCategory =
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "business_rule_violation"
  | "infrastructure_failure"
  | "unexpected_failure";

const ERROR_CATEGORY: Record<ServerErrorCode, ServiceErrorCategory> = {
  NOT_AUTHENTICATED: "authentication",
  DAILY_LIMIT_EXCEEDED: "rate_limit",
  COOLDOWN_ACTIVE: "rate_limit",
  QUEST_NOT_COMPLETE: "business_rule_violation",
  QUEST_ALREADY_CLAIMED: "conflict",
  MILESTONE_NOT_REACHED: "business_rule_violation",
  MILESTONE_ALREADY_CLAIMED: "conflict",
  CANNOT_FOLLOW_SELF: "business_rule_violation",
  UNKNOWN_ACTIVITY: "not_found",
  UNKNOWN_QUEST: "not_found",
  UNKNOWN_MILESTONE: "not_found",
};

/** What every service function returns instead of throwing for an expected business-rule failure (quest not complete, daily limit hit, ...) — see docs/BACKEND_ARCHITECTURE.md §9.3. */
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; category: ServiceErrorCategory; title: string; description: string } };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail(code: string): ServiceResult<never> {
  const knownCode = code in serverErrorCopy ? (code as ServerErrorCode) : undefined;
  const copy = knownCode ? serverErrorCopy[knownCode] : errorCopy.generic;
  const category: ServiceErrorCategory = knownCode ? ERROR_CATEGORY[knownCode] : "unexpected_failure";
  return { ok: false, error: { code, category, ...copy } };
}

/**
 * For zod validation failures specifically — the message zod produces
 * ("Mật khẩu cần ít nhất 8 ký tự.") is already the real, specific,
 * brand-voice-correct thing to show, unlike an RPC error code. Routing
 * this through `fail()` instead would silently discard it (no key in
 * `serverErrorCopy` matches a full sentence, so it'd fall back to the
 * generic message) — this keeps validation errors specific.
 */
export function validationFail(message: string): ServiceResult<never> {
  return {
    ok: false,
    error: { code: "VALIDATION_ERROR", category: "validation", title: "Kiểm tra lại thông tin nhé", description: message },
  };
}

/**
 * A Postgres `security definer` function (§6.2) always `raise exception`s
 * with a bare code string ("DAILY_LIMIT_EXCEEDED", ...) as the message —
 * never a human sentence. Supabase's client surfaces that as
 * `error.message`, sometimes with driver-added context around it, so this
 * matches by substring rather than requiring an exact match. Falls back to
 * `errorCopy.generic` (category `infrastructure_failure`, set directly
 * below rather than through `fail()`'s "unexpected_failure" default,
 * since a real Postgres/network error reaching here is exactly what
 * `infrastructure_failure` means) for anything unrecognized — never
 * shows raw SQL/driver text.
 */
export function mapSupabaseError(error: { message: string }): ServiceResult<never> {
  const code = (Object.keys(serverErrorCopy) as ServerErrorCode[]).find((known) => error.message.includes(known));
  if (!code) return { ok: false, error: { code: "generic", category: "infrastructure_failure", ...errorCopy.generic } };
  return fail(code);
}
