import { Router } from "express";
import { getResume, uploadResume, deleteResume } from "../controllers/resume.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const resumeRouter = Router();

resumeRouter.get("/", authMiddleware, getResume);
resumeRouter.post("/", authMiddleware, ...uploadResume);
resumeRouter.delete("/", authMiddleware, deleteResume);
