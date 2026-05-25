import { Router } from "express";
import { listSkills, createSkill, updateSkill, deleteSkill } from "../controllers/skills.controller";

export const skillsRouter = Router();

skillsRouter.get("/", listSkills);
skillsRouter.post("/", createSkill);
skillsRouter.put("/:skillId", updateSkill);
skillsRouter.delete("/:skillId", deleteSkill);
