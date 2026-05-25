import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { errorEnvelope } from "../utils/responseEnvelope";

const stub = (name: string) =>
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json(errorEnvelope("NOT_IMPLEMENTED", `auth.${name} not implemented`, 501));
  });

export const signup = stub("signup");
export const login = stub("login");
export const logout = stub("logout");
export const deleteAccount = stub("deleteAccount");
export const getSession = stub("getSession");
