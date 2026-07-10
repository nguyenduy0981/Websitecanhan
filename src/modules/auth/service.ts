import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "./password";
import { SESSION_DURATION_MS, generateToken, hashToken, getSessionToken } from "./session";
import type { CookieReader } from "./session";
import { checkRateLimit, RATE_LIMITS } from "./rate-limit";
import { sendPasswordResetEmail } from "./email";
import { env } from "@/env";
import type { RegisterInput, LoginInput, ResetPasswordInput } from "./schemas";

// Not a CLAUDE.md non-negotiable business rule — a recorded assumption
// (owner may override): password reset links stay valid for 1 hour.
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  role: User["role"];
  emailVerified: boolean;
  createdAt: Date;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

export interface AuthResult {
  user: PublicUser;
  sessionToken: string;
  sessionExpiresAt: Date;
}

async function createSessionForUser(
  userId: string,
  meta: { ip?: string; userAgent?: string },
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.create({
    data: {
      id: hashToken(token),
      userId,
      expiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
  return { token, expiresAt };
}

export async function registerUser(
  input: RegisterInput,
  meta: { ip: string; userAgent?: string },
): Promise<AuthResult> {
  await checkRateLimit(`register:${meta.ip}`, RATE_LIMITS.register);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    },
  });

  const { token, expiresAt } = await createSessionForUser(user.id, meta);
  return { user: toPublicUser(user), sessionToken: token, sessionExpiresAt: expiresAt };
}

export async function loginUser(
  input: LoginInput,
  meta: { ip: string; userAgent?: string },
): Promise<AuthResult> {
  await checkRateLimit(`login:${meta.ip}`, RATE_LIMITS.login);
  await checkRateLimit(`login:${input.email}`, RATE_LIMITS.login);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const INVALID_CREDENTIALS = "Invalid email or password";

  if (!user) {
    throw new UnauthorizedError(INVALID_CREDENTIALS);
  }
  if (user.suspendedAt) {
    throw new ForbiddenError("This account has been suspended");
  }

  const passwordOk = await verifyPassword(user.passwordHash, input.password);
  if (!passwordOk) {
    throw new UnauthorizedError(INVALID_CREDENTIALS);
  }

  const { token, expiresAt } = await createSessionForUser(user.id, meta);
  return { user: toPublicUser(user), sessionToken: token, sessionExpiresAt: expiresAt };
}

export async function logoutUser(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: hashToken(sessionToken) } });
}

/**
 * Always resolves without revealing whether the email exists, to avoid
 * account enumeration via the "forgot password" flow.
 */
export async function requestPasswordReset(
  email: string,
  meta: { ip: string },
): Promise<void> {
  await checkRateLimit(`password-reset:${meta.ip}`, RATE_LIMITS.passwordReset);
  await checkRateLimit(`password-reset:${email}`, RATE_LIMITS.passwordReset);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return;
  }

  const token = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashToken(input.token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new ValidationError("This reset link is invalid or has expired");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
    // Resetting the password invalidates every existing session.
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);
}

export async function getSessionUser(cookies: CookieReader): Promise<PublicUser | null> {
  const token = getSessionToken(cookies);
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.user.suspendedAt) {
    return null;
  }

  return toPublicUser(session.user);
}

export async function requireAuth(cookies: CookieReader): Promise<PublicUser> {
  const user = await getSessionUser(cookies);
  if (!user) {
    throw new UnauthorizedError("Authentication required");
  }
  return user;
}
