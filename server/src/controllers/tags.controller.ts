import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { errorEnvelope } from "../utils/responseEnvelope";

const stub = (name: string) =>
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", `tags.${name} not implemented`, 501));
  });

export const listTags = stub("listTags");
export const createTag = stub("createTag");
export const updateTag = stub("updateTag");
export const deleteTag = stub("deleteTag");
