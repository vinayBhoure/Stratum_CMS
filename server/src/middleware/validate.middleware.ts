import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodType } from "zod";

// Middleware order (fixed): Body parser → ValidateMiddleware → AuthMiddleware → RoleMiddleware → Controller.
// Runs before auth so malformed requests are rejected cheaply. A failed parse
// forwards the ZodError to the error handler, which returns VALIDATION_FAILED (400).
export function validateMiddleware(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}
