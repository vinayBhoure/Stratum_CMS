import { Router } from "express";
import { uploadMedia } from "../controllers/media.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const mediaRouter = Router();

// authMiddleware runs first; multer and upload logic are embedded in the
// uploadMedia handler array since multer must run after auth is verified.
mediaRouter.post("/upload", authMiddleware, ...uploadMedia);
