import { randomBytes, createHmac } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export const SESSION_COOKIE_NAME = "lovebox_session";
// Not a CLAUDE.md non-negotiable business rule — a recorded assumption
// (owner may override): sessions stay valid 30 days from creation.
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/** Cryptographically random opaque token, given to the client (cookie / reset link). */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Deterministic, keyed hash of an opaque token for DB storage/lookup.
 * Only the hash is ever persisted — see CLAUDE.md: Session "id = token hash".
 * Keyed with SESSION_SECRET so leaked DB rows alone can't be replayed as
 * valid cookies without also knowing the secret.
 */
export function hashToken(token: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(token).digest("hex");
}

export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date): void {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(SESSION_COOKIE_NAME)?.value;
}
