// Standard error hierarchy for LoveBox. Every module should throw one of
// these (or a subclass) instead of a bare Error, so route handlers can
// convert it to a consistent, safe API response via handleRouteError.

export interface AppErrorOptions {
  cause?: unknown;
  /** Extra machine-readable context for server-side logs only, never sent to the client. */
  context?: Record<string, unknown>;
}

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  /** Whether `message` is safe to send to the client as-is. */
  readonly expose: boolean = true;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options?: AppErrorOptions) {
    super(message, { cause: options?.cause });
    this.name = this.constructor.name;
    this.context = options?.context;
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";
}

export class RateLimitedError extends AppError {
  readonly statusCode = 429;
  readonly code = "RATE_LIMITED";
}

/** Unexpected server-side failure. Message is never exposed to the client. */
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_ERROR";
  readonly expose = false;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export interface SerializedError {
  statusCode: number;
  body: { error: { code: string; message: string } };
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/** Converts any thrown value into a safe, consistent API error shape. */
export function serializeError(error: unknown): SerializedError {
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.expose ? error.message : GENERIC_MESSAGE,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: { error: { code: "INTERNAL_ERROR", message: GENERIC_MESSAGE } },
  };
}
