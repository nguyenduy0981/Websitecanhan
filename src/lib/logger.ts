import pino from "pino";

// Field names that must never reach log output, however deep they appear.
// See CLAUDE.md: "Never log secrets or full PII."
const REDACTED_KEYS = [
  "password",
  "passwordHash",
  "token",
  "tokenHash",
  "secret",
  "sessionSecret",
  "cronSecret",
  "apiKey",
  "checksumKey",
  "sessionToken",
  "authorization",
  "cookie",
  "email",
];

const redactPaths = REDACTED_KEYS.flatMap((key) => [
  key,
  `*.${key}`,
  `*.*.${key}`,
]);

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  base: { service: "lovebox" },
  serializers: { err: pino.stdSerializers.err },
  transport:
    !isProduction && process.env.NODE_ENV !== "test"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
      : undefined,
});

/**
 * Per-request/job logger carrying a correlation id so related log lines can
 * be grepped together (e.g. one HTTP request or one cron job run).
 */
export function createRequestLogger(requestId: string, extra?: Record<string, unknown>) {
  return logger.child({ requestId, ...extra });
}
