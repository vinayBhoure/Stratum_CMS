import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successEnvelope } from "../utils/responseEnvelope";
import { requireUser } from "../middleware/auth.middleware";
import { ApiError } from "../utils/apiError";
import * as resumeService from "../services/resume.service";

const MAX_PDF = 5 * 1024 * 1024;

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new ApiError(400, "INVALID_FILE", "Only PDF files are accepted for resume") as unknown as null, false);
      return;
    }
    cb(null, true);
  },
}).single("file");

function runPdfUpload(req: Request, res: Response, next: NextFunction): void {
  pdfUpload(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    next(new ApiError(400, "INVALID_FILE", err instanceof Error ? err.message : "File upload failed"));
  });
}

export const getResume = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  const resume = await resumeService.getResume(userId);
  res.status(200).json(successEnvelope(resume, 200));
});

export const uploadResume = [
  runPdfUpload,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = requireUser(req);
    if (!req.file) {
      throw new ApiError(400, "INVALID_FILE", "No file provided");
    }
    const resume = await resumeService.uploadResume(userId, req.file.buffer);
    res.status(201).json(successEnvelope(resume, 201));
  }),
];

export const deleteResume = asyncHandler(async (req, res): Promise<void> => {
  const { userId } = requireUser(req);
  await resumeService.deleteResume(userId);
  res.status(204).send();
});
