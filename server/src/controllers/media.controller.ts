import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { ApiError } from "../utils/apiError";
import * as mediaService from "../services/media.service";

// Wraps multer's callback-style middleware so ApiErrors surface via next()
// rather than crashing the process. Multer MIME/size errors are re-mapped to
// INVALID_FILE so the global error handler picks them up cleanly.
function runUpload(req: Request, res: Response, next: NextFunction): void {
  uploadMiddleware(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    next(new ApiError(400, "INVALID_FILE", err instanceof Error ? err.message : "File upload failed"));
  });
}

export const uploadMedia = [
  asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    requireUser(req);
    next();
  }),
  runUpload,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ApiError(400, "INVALID_FILE", "No file provided");
    }
    const type = (req.body as Record<string, string>).type as "image" | "video" | "pdf";
    const result = await mediaService.uploadBuffer(req.file.buffer, type);
    res.status(201).json(successEnvelope(result, 201));
  }),
];
