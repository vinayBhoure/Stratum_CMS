import { Router } from "express";
import { signup, login, logout, deleteAccount, getSession } from "../controllers/auth.controller";
import { validateMiddleware } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { signupSchema, loginSchema, deleteAccountSchema } from "../validators/auth.schema";

export const authRouter = Router();

// Fixed chain: ValidateMiddleware → AuthMiddleware → Controller.
// Public endpoints (signup, login) never run AuthMiddleware.
authRouter.post("/signup", validateMiddleware(signupSchema), signup);
authRouter.post("/login", validateMiddleware(loginSchema), login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.delete("/account", validateMiddleware(deleteAccountSchema), authMiddleware, deleteAccount);
authRouter.get("/session", authMiddleware, getSession);
