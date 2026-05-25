import { NextFunction, Request, RequestHandler, Response } from "express";

// TODO Phase 5: enforce req.user.role === requiredRole; throw FORBIDDEN if not.
// Must not be applied to non-admin endpoints.
export function roleMiddleware(_requiredRole: string): RequestHandler {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
