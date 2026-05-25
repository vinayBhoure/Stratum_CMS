import { Router } from "express";
import { uploadMedia } from "../controllers/media.controller";

export const mediaRouter = Router();

mediaRouter.post("/upload", uploadMedia);
