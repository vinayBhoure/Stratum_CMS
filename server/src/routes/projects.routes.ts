import { Router } from "express";
import { listProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projects.controller";

export const projectsRouter = Router();

projectsRouter.get("/", listProjects);
projectsRouter.get("/:projectId", getProject);
projectsRouter.post("/", createProject);
projectsRouter.put("/:projectId", updateProject);
projectsRouter.delete("/:projectId", deleteProject);
