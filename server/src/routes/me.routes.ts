import { Router } from "express";
import { getMe, updateMe } from "../controllers/me.controller";
import { validateMiddleware } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { updateProfileSchema } from "../validators/me.schema";

export const meRouter = Router();

meRouter.get("/", authMiddleware, getMe);
meRouter.put("/", validateMiddleware(updateProfileSchema), authMiddleware, updateMe);
