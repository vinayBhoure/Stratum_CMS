import { Router } from "express";
import {
  getPublicUserInfo,
  getPublicProjects,
  getPublicExperience,
  getPublicSkills,
  getPublicTags,
  getPublicResume,
} from "../controllers/public.controller";

export const publicRouter = Router();

publicRouter.get("/:userId/user-info", getPublicUserInfo);
publicRouter.get("/:userId/projects", getPublicProjects);
publicRouter.get("/:userId/experience", getPublicExperience);
publicRouter.get("/:userId/skills", getPublicSkills);
publicRouter.get("/:userId/tags", getPublicTags);
publicRouter.get("/:userId/resume", getPublicResume);
