import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import * as meService from "../services/me.service";

export const getMe = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const profile = await meService.getProfile(userId);
  res.status(200).json(successEnvelope(profile, 200));
});

export const updateMe = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const profile = await meService.updateProfile(userId, req.body);
  res.status(200).json(successEnvelope(profile, 200));
});
