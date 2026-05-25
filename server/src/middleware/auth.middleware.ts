import { NextFunction, Request, Response } from "express";

// TODO Phase 2: verify stratum_token httpOnly cookie, decode JWT, attach req.user.
// Must not be applied to public endpoints.
export function authMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next();
}
