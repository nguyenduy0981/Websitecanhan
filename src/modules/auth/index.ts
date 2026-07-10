// Public API of the `auth` module.
// Other modules must import only from this file — never reach into
// `src/modules/auth/*` internals directly.

export {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  getSessionUser,
  requireAuth,
  type PublicUser,
  type AuthResult,
} from "./service";

export {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type RequestPasswordResetInput,
  type ResetPasswordInput,
} from "./schemas";

export {
  SESSION_COOKIE_NAME,
  setSessionCookie,
  clearSessionCookie,
  getSessionToken,
  type CookieReader,
} from "./session";
