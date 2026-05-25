import { Router } from "express";
import { getMe, updateMe } from "../controllers/me.controller";

export const meRouter = Router();

meRouter.get("/", getMe);
meRouter.put("/", updateMe);
