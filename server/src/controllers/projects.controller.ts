import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import * as projectsService from "../services/projects.service";

export const listProjects = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const result = await projectsService.listProjects(userId, req.query as Record<string, unknown>);
  res.status(200).json(successEnvelope(result, 200));
});

export const getProject = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const project = await projectsService.getProject(userId, req.params.projectId);
  res.status(200).json(successEnvelope(project, 200));
});

export const createProject = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const project = await projectsService.createProject(userId, req.body);
  res.status(201).json(successEnvelope(project, 201));
});

export const updateProject = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const project = await projectsService.updateProject(userId, req.params.projectId, req.body);
  res.status(200).json(successEnvelope(project, 200));
});

export const deleteProject = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  await projectsService.deleteProject(userId, req.params.projectId);
  res.status(204).send();
});
