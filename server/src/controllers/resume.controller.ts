import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { errorEnvelope } from "../utils/responseEnvelope";

const stub = (name: string) =>
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", `resume.${name} not implemented`, 501));
  });

export const getResume = stub("getResume");
export const uploadResume = stub("uploadResume");
export const deleteResume = stub("deleteResume");
