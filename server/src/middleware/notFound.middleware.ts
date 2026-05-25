import { Request, Response } from "express";
import { errorEnvelope } from "../utils/responseEnvelope";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorEnvelope("NOT_FOUND", "Route not found", 404));
}
