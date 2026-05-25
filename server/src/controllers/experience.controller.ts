import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { errorEnvelope } from "../utils/responseEnvelope";

const stub = (name: string) =>
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", `experience.${name} not implemented`, 501));
  });

export const listExperience = stub("listExperience");
export const getExperience = stub("getExperience");
export const createExperience = stub("createExperience");
export const updateExperience = stub("updateExperience");
export const deleteExperience = stub("deleteExperience");
