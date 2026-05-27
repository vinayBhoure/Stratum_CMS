import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateId } from "../utils/nanoId";
import { parsePagination, paginatedData } from "../utils/pagination";
import { CreateSkillInput, UpdateSkillInput } from "../validators/skills.schema";

export async function listSkills(userId: string, query: Record<string, unknown>) {
  const { page, limit, skip, take } = parsePagination(query);
  const [items, total] = await Promise.all([
    prisma.skill.findMany({ where: { userId }, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.skill.count({ where: { userId } }),
  ]);
  return paginatedData(items, total, page, limit);
}

export async function createSkill(userId: string, input: CreateSkillInput) {
  try {
    return await prisma.skill.create({
      data: { id: generateId(), userId, skill: input.skill },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(400, "VALIDATION_FAILED", "You already have a skill with this name");
    }
    throw err;
  }
}

export async function updateSkill(userId: string, skillId: string, input: UpdateSkillInput) {
  const existing = await prisma.skill.findFirst({ where: { id: skillId, userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Skill not found");
  }
  try {
    return await prisma.skill.update({
      where: { id: skillId },
      data: { skill: input.skill },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(400, "VALIDATION_FAILED", "You already have a skill with this name");
    }
    throw err;
  }
}

export async function deleteSkill(userId: string, skillId: string) {
  const existing = await prisma.skill.findFirst({ where: { id: skillId, userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Skill not found");
  }

  const [experienceRefs, projectRefs] = await Promise.all([
    prisma.experienceSkill.findMany({
      where: { skillId },
      include: { experience: { select: { id: true, title: true } } },
    }),
    prisma.projectSkill.findMany({
      where: { skillId },
      include: { project: { select: { id: true, title: true } } },
    }),
  ]);

  if (experienceRefs.length > 0 || projectRefs.length > 0) {
    throw new ApiError(409, "SKILL_IN_USE", "Cannot delete skill — it is referenced by other content.", {
      referencedBy: {
        experiences: experienceRefs.map((r) => ({ id: r.experience.id, title: r.experience.title })),
        projects: projectRefs.map((r) => ({ id: r.project.id, title: r.project.title })),
      },
    });
  }

  await prisma.skill.delete({ where: { id: skillId } });
}
