import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { getCookieOptions, STRATUM_TOKEN_COOKIE } from "../utils/cookie";
import { requireUser } from "../middleware/auth.middleware";
import * as authService from "../services/auth.service";

export const signup = asyncHandler(async (req, res): Promise<void> => {
  const { user, token } = await authService.signup(req.body);
  res.cookie(STRATUM_TOKEN_COOKIE, token, getCookieOptions());
  res.status(201).json(successEnvelope(user, 201));
});

export const login = asyncHandler(async (req, res): Promise<void> => {
  const { user, token } = await authService.login(req.body);
  res.cookie(STRATUM_TOKEN_COOKIE, token, getCookieOptions());
  res.status(200).json(successEnvelope(user, 200));
});

export const logout = asyncHandler(async (req, res): Promise<void> => {
  // AuthMiddleware guarantees a valid token cookie is present.
  await authService.logout(req.cookies[STRATUM_TOKEN_COOKIE]);
  res.clearCookie(STRATUM_TOKEN_COOKIE, getCookieOptions());
  res.status(200).json(successEnvelope({ message: "Logged out" }, 200));
});

export const deleteAccount = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  await authService.deleteAccount(userId, req.cookies[STRATUM_TOKEN_COOKIE], req.body.password);
  res.clearCookie(STRATUM_TOKEN_COOKIE, getCookieOptions());
  res.status(200).json(successEnvelope({ message: "Account deleted" }, 200));
});

export const getSession = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const session = await authService.getSession(userId);
  res.status(200).json(successEnvelope(session, 200));
});
