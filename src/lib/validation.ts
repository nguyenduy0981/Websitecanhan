import type { ZodSchema } from "zod";
import { ValidationError } from "@/lib/errors";

/** Parses `data` against `schema`, throwing a ValidationError (400) on failure. */
export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
      .join("; ");
    throw new ValidationError(message || "Invalid input");
  }
  return result.data;
}
