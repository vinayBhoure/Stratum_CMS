import { Router } from "express";
import { listTags, createTag, updateTag, deleteTag } from "../controllers/tags.controller";
import { validateMiddleware } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { createTagSchema, updateTagSchema } from "../validators/tags.schema";

export const tagsRouter = Router();

tagsRouter.get("/", authMiddleware, listTags);
tagsRouter.post("/", validateMiddleware(createTagSchema), authMiddleware, createTag);
tagsRouter.put("/:tagId", validateMiddleware(updateTagSchema), authMiddleware, updateTag);
tagsRouter.delete("/:tagId", authMiddleware, deleteTag);
