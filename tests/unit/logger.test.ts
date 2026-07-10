import { describe, expect, it } from "vitest";
import { Writable } from "node:stream";
import pino from "pino";

// Exercise the same redact config as src/lib/logger.ts against a capturable
// stream, since the shared logger writes to stdout/pino-pretty by default.
function buildTestLogger(onLine: (line: Record<string, unknown>) => void) {
  const stream = new Writable({
    write(chunk, _enc, callback) {
      onLine(JSON.parse(chunk.toString()));
      callback();
    },
  });

  return pino(
    {
      redact: {
        paths: ["password", "*.password", "*.*.password", "email", "*.email", "*.*.email"],
        censor: "[REDACTED]",
      },
    },
    stream,
  );
}

describe("logger redaction", () => {
  it("redacts password and email fields regardless of nesting", () => {
    let captured: Record<string, unknown> | undefined;
    const log = buildTestLogger((line) => {
      captured = line;
    });

    log.info({ user: { email: "owner@example.com", password: "hunter2" } }, "user created");

    expect(captured).toBeDefined();
    const user = captured!.user as Record<string, unknown>;
    expect(user.email).toBe("[REDACTED]");
    expect(user.password).toBe("[REDACTED]");
  });
});
