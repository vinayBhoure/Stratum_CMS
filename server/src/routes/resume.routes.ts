import { Router } from "express";
import { getResume, uploadResume, deleteResume } from "../controllers/resume.controller";

export const resumeRouter = Router();

resumeRouter.get("/", getResume);
resumeRouter.post("/", uploadResume);
resumeRouter.delete("/", deleteResume);
