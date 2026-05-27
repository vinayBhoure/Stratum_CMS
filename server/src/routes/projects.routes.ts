import { Router } from "express";
import { listProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projects.controller";
import { validateMiddleware } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { createProjectSchema, updateProjectSchema } from "../validators/projects.schema";

export const projectsRouter = Router();

projectsRouter.get("/", authMiddleware, listProjects);
projectsRouter.get("/:projectId", authMiddleware, getProject);
projectsRouter.post("/", validateMiddleware(createProjectSchema), authMiddleware, createProject);
projectsRouter.put("/:projectId", validateMiddleware(updateProjectSchema), authMiddleware, updateProject);
projectsRouter.delete("/:projectId", authMiddleware, deleteProject);
