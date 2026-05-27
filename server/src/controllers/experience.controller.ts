import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import * as experienceService from "../services/experience.service";

export const listExperience = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const result = await experienceService.listExperience(userId, req.query as Record<string, unknown>);
  res.status(200).json(successEnvelope(result, 200));
});

export const getExperience = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const exp = await experienceService.getExperience(userId, req.params.experienceId);
  res.status(200).json(successEnvelope(exp, 200));
});

export const createExperience = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const exp = await experienceService.createExperience(userId, req.body);
  res.status(201).json(successEnvelope(exp, 201));
});

export const updateExperience = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const exp = await experienceService.updateExperience(userId, req.params.experienceId, req.body);
  res.status(200).json(successEnvelope(exp, 200));
});

export const deleteExperience = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  await experienceService.deleteExperience(userId, req.params.experienceId);
  res.status(204).send();
});
