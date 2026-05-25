import { Router } from "express";

// Aggregator for all /api/v1 domain routers.
// Phase 1+ attaches auth, projects, experience, skills, tags, resume, media,
// and admin routers here. Empty in Phase 0.
export const apiRouter = Router();
