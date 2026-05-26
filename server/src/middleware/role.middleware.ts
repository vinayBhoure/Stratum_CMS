import { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/apiError";

// Runs AFTER AuthMiddleware on role-gated routes. Kept separate from
// AuthMiddleware so the auth check can be reused on non-admin routes.
export function roleMiddleware(requiredRole: Role): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== requiredRole) {
      next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
