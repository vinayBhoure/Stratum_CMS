import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

// JWT lifetime matches the cookie maxAge and the token_blacklist cleanup window.
const TOKEN_TTL = "7d";

// Payload is intentionally minimal — verified on every authenticated request.
// Only userId and role; everything mutable (name, email) is fetched from DB.
export interface TokenPayload {
  userId: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

// Throws (TokenExpiredError / JsonWebTokenError) on invalid input — callers map
// these to INVALID_TOKEN. The token is untrusted external input, so the decoded
// shape is validated at runtime rather than asserted.
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (
    typeof decoded === "object" &&
    decoded !== null &&
    typeof decoded.userId === "string" &&
    (decoded.role === "user" || decoded.role === "masterAdmin")
  ) {
    return { userId: decoded.userId, role: decoded.role };
  }
  throw new jwt.JsonWebTokenError("Malformed token payload");
}
