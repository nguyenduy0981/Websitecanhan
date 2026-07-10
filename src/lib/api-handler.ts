import { NextResponse, type NextRequest } from "next/server";
import type { Logger } from "pino";
import { createRequestLogger } from "@/lib/logger";
import { isAppError, serializeError } from "@/lib/errors";

export interface RouteHandlerContext {
  log: Logger;
  requestId: string;
}

/** Matches the `{ params: Promise<...> }` shape Next.js 15 route handlers
 * always receive as their second argument, even on routes with no dynamic
 * segments (where params resolves to `{}`). */
export interface RouteParamsContext {
  params: Promise<Record<string, string | string[] | undefined>>;
}

type RouteHandler<Ctx> = (
  req: NextRequest,
  ctx: Ctx & RouteHandlerContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a Next.js App Router route handler with a request-scoped structured
 * logger and uniform error handling, so every route returns the same JSON
 * error shape and never leaks internals to the client. See CLAUDE.md:
 * "Never log secrets or full PII."
 */
export function withApiHandler<Ctx extends RouteParamsContext = RouteParamsContext>(
  handler: RouteHandler<Ctx>,
) {
  return async (req: NextRequest, ctx: Ctx): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const log = createRequestLogger(requestId, {
      method: req.method,
      path: req.nextUrl.pathname,
    });

    try {
      const res = await handler(req, { ...ctx, log, requestId });
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (error) {
      const { statusCode, body } = serializeError(error);

      if (isAppError(error) && error.expose && statusCode < 500) {
        log.warn({ err: error, statusCode, code: body.error.code, context: error.context }, "request failed");
      } else {
        log.error({ err: error, statusCode }, "unhandled request error");
      }

      const res = NextResponse.json(body, { status: statusCode });
      res.headers.set("x-request-id", requestId);
      return res;
    }
  };
}
