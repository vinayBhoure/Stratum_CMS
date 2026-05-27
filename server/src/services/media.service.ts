import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/apiError";

type MediaType = "image" | "video" | "pdf";

const RESOURCE_TYPE: Record<MediaType, "image" | "video" | "raw"> = {
  image: "image",
  video: "video",
  pdf:   "raw",
};

const MAX_BYTES: Record<MediaType, number> = {
  image: 5  * 1024 * 1024,
  video: 50 * 1024 * 1024,
  pdf:   5  * 1024 * 1024,
};

export async function uploadBuffer(buffer: Buffer, type: MediaType): Promise<{ url: string; type: MediaType }> {
  if (!["image", "video", "pdf"].includes(type)) {
    throw new ApiError(400, "INVALID_FILE", "type must be one of: image, video, pdf");
  }
  if (buffer.byteLength > MAX_BYTES[type]) {
    throw new ApiError(400, "INVALID_FILE", `File exceeds maximum size for type ${type}`);
  }

  const url = await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: RESOURCE_TYPE[type], folder: "stratum_cms" },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new ApiError(500, "INTERNAL_ERROR", error.message ?? "Cloudinary upload failed"));
        }
        if (!result) {
          return reject(new ApiError(500, "INTERNAL_ERROR", "Cloudinary returned no result"));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

  return { url, type };
}
