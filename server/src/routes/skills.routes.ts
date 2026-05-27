import { Router } from "express";
import { listSkills, createSkill, updateSkill, deleteSkill } from "../controllers/skills.controller";
import { validateMiddleware } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { createSkillSchema, updateSkillSchema } from "../validators/skills.schema";

export const skillsRouter = Router();

skillsRouter.get("/", authMiddleware, listSkills);
skillsRouter.post("/", validateMiddleware(createSkillSchema), authMiddleware, createSkill);
skillsRouter.put("/:skillId", validateMiddleware(updateSkillSchema), authMiddleware, updateSkill);
skillsRouter.delete("/:skillId", authMiddleware, deleteSkill);
