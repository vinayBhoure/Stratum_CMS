import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodSchema } from "zod";

// TODO Phase 2/3: replace with real Zod validation against the provided schema.
// Middleware order (fixed): Body parser → ValidateMiddleware → AuthMiddleware → RoleMiddleware → Controller.
export function validateMiddleware(_schema: ZodSchema): RequestHandler {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
