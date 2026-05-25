import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";
import { errorEnvelope } from "../utils/responseEnvelope";
import { env } from "../config/env";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (env.nodeEnv !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(errorEnvelope(err.code, err.message, err.statusCode, err.details));
    return;
  }

  if (err instanceof ZodError) {
    res
      .status(400)
      .json(
        errorEnvelope(
          "VALIDATION_FAILED",
          "Request validation failed",
          400,
          err.flatten()
        )
      );
    return;
  }

  // Body-parser throws a SyntaxError with status 400 when JSON is malformed.
  if (
    err instanceof SyntaxError &&
    (err as SyntaxError & { status?: number; type?: string }).type ===
      "entity.parse.failed"
  ) {
    res
      .status(400)
      .json(errorEnvelope("VALIDATION_FAILED", "Malformed JSON body", 400));
    return;
  }

  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  res.status(500).json(errorEnvelope("INTERNAL_ERROR", message, 500));
}
