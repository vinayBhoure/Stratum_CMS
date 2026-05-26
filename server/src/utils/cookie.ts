import { CookieOptions } from "express";
import { env } from "../config/env";

export const STRATUM_TOKEN_COOKIE = "stratum_token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Per api_contracts.md §1.3 / auth-flow Step 1: attributes differ by environment.
// Production is cross-site (Vercel ↔ Railway) so needs sameSite:'none' + secure.
// clearCookie must be called with the SAME options (minus maxAge) or some
// browsers won't clear the cookie — callers reuse this object for both.
export function getCookieOptions(): CookieOptions {
  const isProd = env.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  };
}
