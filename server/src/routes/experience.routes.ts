import { Router } from "express";
import { listExperience, getExperience, createExperience, updateExperience, deleteExperience } from "../controllers/experience.controller";

export const experienceRouter = Router();

experienceRouter.get("/", listExperience);
experienceRouter.get("/:experienceId", getExperience);
experienceRouter.post("/", createExperience);
experienceRouter.put("/:experienceId", updateExperience);
experienceRouter.delete("/:experienceId", deleteExperience);
