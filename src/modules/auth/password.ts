import argon2 from "argon2";

// See CLAUDE.md security rules: "Auth: argon2id hashing."
export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    // Malformed/foreign hash (e.g. hash format changed) — treat as no match
    // rather than throwing, so callers always get a boolean.
    return false;
  }
}
