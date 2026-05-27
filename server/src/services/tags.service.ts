import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateId } from "../utils/nanoId";
import { parsePagination, paginatedData } from "../utils/pagination";
import { CreateTagInput, UpdateTagInput } from "../validators/tags.schema";

export async function listTags(userId: string, query: Record<string, unknown>) {
  const { page, limit, skip, take } = parsePagination(query);
  const where: Prisma.TagWhereInput = {
    OR: [{ userId }, { isSystem: true }],
  };
  const [items, total] = await Promise.all([
    prisma.tag.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.tag.count({ where }),
  ]);
  return paginatedData(items, total, page, limit);
}

export async function createTag(userId: string, input: CreateTagInput) {
  try {
    return await prisma.tag.create({
      data: { id: generateId(), userId, name: input.name, isSystem: false },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(400, "VALIDATION_FAILED", "You already have a tag with this name");
    }
    throw err;
  }
}

export async function updateTag(userId: string, tagId: string, input: UpdateTagInput) {
  const existing = await prisma.tag.findFirst({ where: { id: tagId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Tag not found");
  }
  if (existing.isSystem) {
    throw new ApiError(409, "SYSTEM_TAG_PROTECTED", "System tags cannot be modified");
  }
  if (existing.userId !== userId) {
    throw new ApiError(404, "NOT_FOUND", "Tag not found");
  }
  try {
    return await prisma.tag.update({ where: { id: tagId }, data: { name: input.name } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(400, "VALIDATION_FAILED", "You already have a tag with this name");
    }
    throw err;
  }
}

export async function deleteTag(userId: string, tagId: string) {
  const existing = await prisma.tag.findFirst({ where: { id: tagId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Tag not found");
  }
  if (existing.isSystem) {
    throw new ApiError(409, "SYSTEM_TAG_PROTECTED", "System tags cannot be deleted");
  }
  if (existing.userId !== userId) {
    throw new ApiError(404, "NOT_FOUND", "Tag not found");
  }

  const projectRefs = await prisma.projectTag.findMany({
    where: { tagId },
    include: { project: { select: { id: true, title: true } } },
  });

  if (projectRefs.length > 0) {
    throw new ApiError(409, "TAG_IN_USE", "Cannot delete tag — it is referenced by projects.", {
      referencedBy: {
        projects: projectRefs.map((r) => ({ id: r.project.id, title: r.project.title })),
      },
    });
  }

  await prisma.tag.delete({ where: { id: tagId } });
}
