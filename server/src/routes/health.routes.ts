import { Request, Response, Router } from "express";
import { successEnvelope } from "../utils/responseEnvelope";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json(
    successEnvelope({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  );
});
