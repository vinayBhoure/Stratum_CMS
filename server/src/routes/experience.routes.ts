import { Router } from "express";
import { listExperience, getExperience, createExperience, updateExperience, deleteExperience } from "../controllers/experience.controller";
import { validateMiddleware } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { createExperienceSchema, updateExperienceSchema } from "../validators/experience.schema";

export const experienceRouter = Router();

experienceRouter.get("/", authMiddleware, listExperience);
experienceRouter.get("/:experienceId", authMiddleware, getExperience);
experienceRouter.post("/", validateMiddleware(createExperienceSchema), authMiddleware, createExperience);
experienceRouter.put("/:experienceId", validateMiddleware(updateExperienceSchema), authMiddleware, updateExperience);
experienceRouter.delete("/:experienceId", authMiddleware, deleteExperience);
