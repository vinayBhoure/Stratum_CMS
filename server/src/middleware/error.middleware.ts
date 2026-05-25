import { NextFunction, Request, Response } from "express";
import { errorEnvelope } from "../utils/responseEnvelope";
import { env } from "../config/env";

// Global error handler — must be registered LAST in the middleware chain.
// Phase 1 enriches this with ApiError handling and Zod validation details.
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  if (env.nodeEnv !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res
    .status(500)
    .json(errorEnvelope("INTERNAL_ERROR", message, 500));
}
