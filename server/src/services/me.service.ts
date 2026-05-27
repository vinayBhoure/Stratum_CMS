import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { UpdateProfileInput } from "../validators/me.schema";

export async function getProfile(userId: string) {
  const profile = await prisma.userInformation.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
  }
  return profile;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const existing = await prisma.userInformation.findUnique({
    where: { userId },
    select: { userId: true },
  });
  if (!existing) {
    throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
  }

  return prisma.userInformation.update({
    where: { userId },
    data: {
      name: input.name,
      email: input.email ?? null,
      contactNumber: input.contactNumber
        ? (input.contactNumber as Prisma.InputJsonValue)
        : Prisma.DbNull,
      address: input.address ?? null,
      googleLocationLink: input.googleLocationLink ?? null,
      socialMediaLinks: input.socialMediaLinks
        ? (input.socialMediaLinks as Prisma.InputJsonValue)
        : Prisma.DbNull,
    },
  });
}
