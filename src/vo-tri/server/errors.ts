import { errorCopy, serverErrorCopy, type ServerErrorCode } from "@/vo-tri/copy/microcopy";

/** What every service function returns instead of throwing for an expected business-rule failure (quest not complete, daily limit hit, ...) — see docs/BACKEND_ARCHITECTURE.md §9.3. */
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; title: string; description: string } };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail(code: string): ServiceResult<never> {
  const copy = serverErrorCopy[code as ServerErrorCode] ?? errorCopy.generic;
  return { ok: false, error: { code, ...copy } };
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
  return { ok: false, error: { code: "VALIDATION_ERROR", title: "Kiểm tra lại thông tin nhé", description: message } };
}

/**
 * A Postgres `security definer` function (§6.2) always `raise exception`s
 * with a bare code string ("DAILY_LIMIT_EXCEEDED", ...) as the message —
 * never a human sentence. Supabase's client surfaces that as
 * `error.message`, sometimes with driver-added context around it, so this
 * matches by substring rather than requiring an exact match. Falls back to
 * `errorCopy.generic` for anything unrecognized (a real infra error, not
 * an expected business-rule rejection) — never shows raw SQL/driver text.
 */
export function mapSupabaseError(error: { message: string }): ServiceResult<never> {
  const code = (Object.keys(serverErrorCopy) as ServerErrorCode[]).find((known) => error.message.includes(known));
  return fail(code ?? "generic");
}
