import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import * as skillsService from "../services/skills.service";

export const listSkills = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const result = await skillsService.listSkills(userId, req.query as Record<string, unknown>);
  res.status(200).json(successEnvelope(result, 200));
});

export const createSkill = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const skill = await skillsService.createSkill(userId, req.body);
  res.status(201).json(successEnvelope(skill, 201));
});

export const updateSkill = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const skill = await skillsService.updateSkill(userId, req.params.skillId, req.body);
  res.status(200).json(successEnvelope(skill, 200));
});

export const deleteSkill = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  await skillsService.deleteSkill(userId, req.params.skillId);
  res.status(204).send();
});
