import { Router } from "express";
import { listTags, createTag, updateTag, deleteTag } from "../controllers/tags.controller";

export const tagsRouter = Router();

tagsRouter.get("/", listTags);
tagsRouter.post("/", createTag);
tagsRouter.put("/:tagId", updateTag);
tagsRouter.delete("/:tagId", deleteTag);
