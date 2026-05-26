import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { apiRouter } from "./routes";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

export const app = express();

// Body parsing — 1mb cap prevents trivially large payloads.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parsing — AuthMiddleware reads the stratum_token httpOnly cookie.
app.use(cookieParser());

// CORS — credentials enabled for the httpOnly cookie auth used from Phase 2.
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Health check (root-level, not under /api/v1).
app.use("/health", healthRouter);

// Versioned API surface. Domain routers attach in Phase 1+.
app.use("/api/v1", apiRouter);

// 404 handler — catches any route not matched above.
app.use(notFoundHandler);

// Global error handler — must stay last.
app.use(errorMiddleware);
