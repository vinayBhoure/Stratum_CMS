import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { errorEnvelope } from "../utils/responseEnvelope";

const stub = (name: string) =>
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", `projects.${name} not implemented`, 501));
  });

export const listProjects = stub("listProjects");
export const getProject = stub("getProject");
export const createProject = stub("createProject");
export const updateProject = stub("updateProject");
export const deleteProject = stub("deleteProject");
