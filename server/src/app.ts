import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

export const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Global error handler — must stay last.
app.use(errorMiddleware);
