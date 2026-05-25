import { Router } from "express";
import { authRouter } from "./auth.routes";
import { meRouter } from "./me.routes";
import { skillsRouter } from "./skills.routes";
import { tagsRouter } from "./tags.routes";
import { projectsRouter } from "./projects.routes";
import { experienceRouter } from "./experience.routes";
import { resumeRouter } from "./resume.routes";
import { mediaRouter } from "./media.routes";
import { adminRouter } from "./admin.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/skills", skillsRouter);
apiRouter.use("/tags", tagsRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/experience", experienceRouter);
apiRouter.use("/resume", resumeRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/admin", adminRouter);
