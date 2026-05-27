import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ApiError } from "../utils/apiError";

const ALLOWED: Record<string, { mimes: string[]; maxBytes: number }> = {
  image: { mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  video: { mimes: ["video/mp4", "video/webm"],               maxBytes: 50 * 1024 * 1024 },
  pdf:   { mimes: ["application/pdf"],                        maxBytes: 5 * 1024 * 1024 },
};

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const type = (_req.body as Record<string, unknown>)?.type as string | undefined;
  const rule = type ? ALLOWED[type] : undefined;

  if (!rule) {
    cb(new ApiError(400, "INVALID_FILE", "type must be one of: image, video, pdf") as unknown as null, false);
    return;
  }
  if (!rule.mimes.includes(file.mimetype)) {
    cb(
      new ApiError(400, "INVALID_FILE", `Invalid MIME type for ${type}. Allowed: ${rule.mimes.join(", ")}`) as unknown as null,
      false
    );
    return;
  }
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
}).single("file");
