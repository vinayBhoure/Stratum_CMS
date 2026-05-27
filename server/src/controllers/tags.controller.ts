import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import * as tagsService from "../services/tags.service";

export const listTags = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const result = await tagsService.listTags(userId, req.query as Record<string, unknown>);
  res.status(200).json(successEnvelope(result, 200));
});

export const createTag = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const tag = await tagsService.createTag(userId, req.body);
  res.status(201).json(successEnvelope(tag, 201));
});

export const updateTag = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const tag = await tagsService.updateTag(userId, req.params.tagId, req.body);
  res.status(200).json(successEnvelope(tag, 200));
});

export const deleteTag = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  await tagsService.deleteTag(userId, req.params.tagId);
  res.status(204).send();
});
