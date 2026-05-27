import { cloudinary } from "../config/cloudinary";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

// Cloudinary URLs follow: https://res.cloudinary.com/<cloud>/raw/upload/<version>/<folder>/<filename>
// public_id is everything after /upload/<version>/ (or after /upload/ if no version).
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

async function deleteCloudinaryAsset(url: string): Promise<void> {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
}

export async function getResume(userId: string) {
  const resume = await prisma.resume.findUnique({ where: { userId } });
  return resume ?? null;
}

export async function uploadResume(userId: string, buffer: Buffer): Promise<{ url: string; createdAt: Date; updatedAt: Date }> {
  const url = await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "stratum_cms/resumes" },
      (error, result) => {
        if (error) return reject(new ApiError(500, "INTERNAL_ERROR", error.message ?? "Cloudinary upload failed"));
        if (!result) return reject(new ApiError(500, "INTERNAL_ERROR", "Cloudinary returned no result"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

  // If a resume exists, delete the old Cloudinary asset before replacing.
  const existing = await prisma.resume.findUnique({ where: { userId } });
  if (existing) {
    await deleteCloudinaryAsset(existing.url);
  }

  return prisma.resume.upsert({
    where: { userId },
    create: { userId, url },
    update: { url },
  });
}

export async function deleteResume(userId: string): Promise<void> {
  const existing = await prisma.resume.findUnique({ where: { userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "No resume found");
  }
  await deleteCloudinaryAsset(existing.url);
  await prisma.resume.delete({ where: { userId } });
}
