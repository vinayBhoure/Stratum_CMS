import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateId } from "../utils/nanoId";
import { parsePagination, paginatedData } from "../utils/pagination";
import { CreateProjectInput, UpdateProjectInput } from "../validators/projects.schema";

async function assertReferences(userId: string, skillIds: string[], tagIds: string[]) {
  if (skillIds.length > 0) {
    const owned = await prisma.skill.count({
      where: { id: { in: skillIds }, userId },
    });
    if (owned !== skillIds.length) {
      throw new ApiError(400, "INVALID_REFERENCE", "One or more skillIds do not exist or are not owned by you");
    }
  }

  if (tagIds.length > 0) {
    const accessible = await prisma.tag.count({
      where: {
        id: { in: tagIds },
        OR: [{ userId }, { isSystem: true }],
      },
    });
    if (accessible !== tagIds.length) {
      throw new ApiError(400, "INVALID_REFERENCE", "One or more tagIds do not exist or are not accessible");
    }
  }
}

function includeShape() {
  return {
    projectSkills: { include: { skill: { select: { id: true, skill: true } } } },
    projectTags: { include: { tag: { select: { id: true, name: true, isSystem: true } } } },
  } as const;
}

function shapeProject(raw: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  githubLink: string | null;
  liveLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  projectSkills: { skill: { id: string; skill: string } }[];
  projectTags: { tag: { id: string; name: string; isSystem: boolean } }[];
}) {
  const { projectSkills, projectTags, ...fields } = raw;
  return {
    ...fields,
    skills: projectSkills.map((ps) => ps.skill),
    tags: projectTags.map((pt) => pt.tag),
  };
}

export async function listProjects(userId: string, query: Record<string, unknown>) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId };
  const [raw, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: includeShape(),
    }),
    prisma.project.count({ where }),
  ]);
  return paginatedData(raw.map(shapeProject), total, page, limit);
}

export async function getProject(userId: string, projectId: string) {
  const raw = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: includeShape(),
  });
  if (!raw) {
    throw new ApiError(404, "NOT_FOUND", "Project not found");
  }
  return shapeProject(raw);
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const skillIds = input.skillIds ?? [];
  const tagIds = input.tagIds ?? [];
  await assertReferences(userId, skillIds, tagIds);

  const id = generateId();

  await prisma.$transaction(async (tx) => {
    await tx.project.create({
      data: {
        id,
        userId,
        title: input.title,
        description: input.description ?? null,
        mediaUrl: input.mediaUrl ?? null,
        githubLink: input.githubLink ?? null,
        liveLink: input.liveLink ?? null,
      },
    });
    if (skillIds.length > 0) {
      await tx.projectSkill.createMany({
        data: skillIds.map((skillId) => ({ projectId: id, skillId })),
      });
    }
    if (tagIds.length > 0) {
      await tx.projectTag.createMany({
        data: tagIds.map((tagId) => ({ projectId: id, tagId })),
      });
    }
  });

  const raw = await prisma.project.findUniqueOrThrow({
    where: { id },
    include: includeShape(),
  });
  return shapeProject(raw);
}

export async function updateProject(userId: string, projectId: string, input: UpdateProjectInput) {
  const existing = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Project not found");
  }

  const skillIds = input.skillIds ?? [];
  const tagIds = input.tagIds ?? [];
  await assertReferences(userId, skillIds, tagIds);

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        title: input.title,
        description: input.description ?? null,
        mediaUrl: input.mediaUrl ?? null,
        githubLink: input.githubLink ?? null,
        liveLink: input.liveLink ?? null,
      },
    });
    await tx.projectSkill.deleteMany({ where: { projectId } });
    await tx.projectTag.deleteMany({ where: { projectId } });
    if (skillIds.length > 0) {
      await tx.projectSkill.createMany({
        data: skillIds.map((skillId) => ({ projectId, skillId })),
      });
    }
    if (tagIds.length > 0) {
      await tx.projectTag.createMany({
        data: tagIds.map((tagId) => ({ projectId, tagId })),
      });
    }
  });

  const raw = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: includeShape(),
  });
  return shapeProject(raw);
}

export async function deleteProject(userId: string, projectId: string) {
  const existing = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Project not found");
  }
  await prisma.project.delete({ where: { id: projectId } });
}
