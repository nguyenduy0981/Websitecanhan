import { randomBytes } from "node:crypto";

// 72 bits of randomness — see CLAUDE.md: gift slugs must be "unguessable".
const SLUG_BYTES = 9;

/**
 * A candidate gift slug. Not guaranteed unique on its own — callers must
 * handle a unique-constraint conflict on insert and retry with a fresh one
 * (see createGift in service.ts), since a separate existence check first
 * would be a check-then-act race under concurrent requests.
 */
export function generateSlug(): string {
  return randomBytes(SLUG_BYTES).toString("base64url");
}
