import { describe, expect, it } from "vitest";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
  isAppError,
  serializeError,
} from "@/lib/errors";

describe("AppError subclasses", () => {
  it("carries the right status code and machine-readable code", () => {
    expect(new ValidationError("bad input").statusCode).toBe(400);
    expect(new ValidationError("bad input").code).toBe("VALIDATION_ERROR");
    expect(new NotFoundError("missing").statusCode).toBe(404);
    expect(new ConflictError("dup").statusCode).toBe(409);
  });

  it("is recognized by isAppError, plain Error is not", () => {
    expect(isAppError(new ValidationError("x"))).toBe(true);
    expect(isAppError(new Error("x"))).toBe(false);
  });
});

describe("serializeError", () => {
  it("exposes the message for client-safe errors", () => {
    const { statusCode, body } = serializeError(new NotFoundError("Gift not found"));
    expect(statusCode).toBe(404);
    expect(body).toEqual({ error: { code: "NOT_FOUND", message: "Gift not found" } });
  });

  it("never exposes the real message for InternalError", () => {
    const { statusCode, body } = serializeError(
      new InternalError("Neon connection string leaked here"),
    );
    expect(statusCode).toBe(500);
    expect(body.error.message).not.toContain("Neon");
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });

  it("maps unknown thrown values to a generic 500 without leaking details", () => {
    const { statusCode, body } = serializeError(new Error("raw stack trace details"));
    expect(statusCode).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).not.toContain("raw stack trace details");
  });
});
