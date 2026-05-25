import { Router } from "express";
import { signup, login, logout, deleteAccount, getSession } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.delete("/account", deleteAccount);
authRouter.get("/session", getSession);
