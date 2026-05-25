import { Router } from "express";
import { listUsers, getUser, deleteUser } from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.get("/users", listUsers);
adminRouter.get("/users/:userId", getUser);
adminRouter.delete("/users/:userId", deleteUser);
