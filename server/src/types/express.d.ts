import { Role } from "@prisma/client";

// AuthMiddleware attaches req.user after verifying the stratum_token cookie.
// Optional because public routes never run AuthMiddleware — use requireUser()
// in protected controllers to get a guaranteed non-optional value.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}
