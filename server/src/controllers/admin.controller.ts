import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { errorEnvelope } from "../utils/responseEnvelope";

const stub = (name: string) =>
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", `admin.${name} not implemented`, 501));
  });

export const listUsers = stub("listUsers");
export const getUser = stub("getUser");
export const deleteUser = stub("deleteUser");
