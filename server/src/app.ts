import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { apiRouter } from "./routes";
import { publicRouter } from "./routes/public.routes";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

export const app = express();

// Body parsing — 1mb cap prevents trivially large payloads.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parsing — AuthMiddleware reads the stratum_token httpOnly cookie.
app.use(cookieParser());

// Public API CORS — open to all origins, no credentials. Scoped to /v1 only
// so the cookie surface on /api/v1 keeps its origin lock (D-P4-04).
app.use("/v1", cors({ origin: "*", credentials: false }));

// Private API CORS — credentials enabled for the httpOnly cookie (Phase 2+).
// Scoped to /api/v1 so the wildcard above does not pollute this surface.
app.use(
  "/api/v1",
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Health check (root-level, not under /api/v1).
app.use("/health", healthRouter);

// Public read-only API — no auth, host-agnostic, cached (D-P4-04).
app.use("/v1", publicRouter);

// Versioned API surface. Domain routers attach in Phase 1+.
app.use("/api/v1", apiRouter);

// 404 handler — catches any route not matched above.
app.use(notFoundHandler);

// Global error handler — must stay last.
app.use(errorMiddleware);
