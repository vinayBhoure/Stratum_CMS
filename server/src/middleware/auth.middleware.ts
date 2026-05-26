import { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { STRATUM_TOKEN_COOKIE } from "../utils/cookie";
import { prisma } from "../config/prisma";

// Middleware order (fixed): Body parser → ValidateMiddleware → AuthMiddleware → RoleMiddleware → Controller.
// Must only be applied to authenticated routes, never public ones.
export const authMiddleware = asyncHandler(async (req, _res, next): Promise<void> => {
  const token: unknown = req.cookies?.[STRATUM_TOKEN_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }

  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "INVALID_TOKEN", "Invalid or expired token");
  }

  const revoked = await prisma.tokenBlacklist.findUnique({
    where: { token },
    select: { id: true },
  });
  if (revoked) {
    throw new ApiError(401, "TOKEN_REVOKED", "Session has been revoked");
  }

  req.user = { userId: payload.userId, role: payload.role };
  next();
});

// Guarantees a non-optional user for protected controllers without a non-null
// assertion. AuthMiddleware always runs first, so this should never throw.
export function requireUser(req: Request): { userId: string; role: TokenPayload["role"] } {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
  }
  return req.user;
}
