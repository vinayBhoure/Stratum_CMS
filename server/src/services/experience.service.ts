import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateId } from "../utils/nanoId";
import { parsePagination, paginatedData } from "../utils/pagination";
import { CreateExperienceInput, UpdateExperienceInput } from "../validators/experience.schema";

interface StoredCertificate {
  name: string;
  url: string;
  updatedAt: string;
  isActive: boolean;
}

function assertDuration(activeJob: boolean, durationFrom: string, durationTo: string | null | undefined): void {
  if (activeJob) {
    if (durationTo != null) {
      throw new ApiError(400, "INVALID_DURATION", "activeJob is true — durationTo must be null");
    }
  } else {
    if (durationTo == null) {
      throw new ApiError(400, "INVALID_DURATION", "activeJob is false — durationTo is required");
    }
    if (new Date(durationTo) <= new Date(durationFrom)) {
      throw new ApiError(400, "INVALID_DURATION", "durationTo must be after durationFrom");
    }
  }
}

async function assertSkillReferences(userId: string, skillIds: string[]): Promise<void> {
  if (skillIds.length === 0) return;
  const owned = await prisma.skill.count({ where: { id: { in: skillIds }, userId } });
  if (owned !== skillIds.length) {
    throw new ApiError(400, "INVALID_REFERENCE", "One or more skillIds do not exist or are not owned by you");
  }
}

function buildCertificatesForInsert(
  certs: Array<{ name: string; url: string; isActive?: boolean }>
): StoredCertificate[] {
  const now = new Date().toISOString();
  return certs.map((c) => ({ name: c.name, url: c.url, updatedAt: now, isActive: c.isActive ?? true }));
}

function mergeCertificates(
  existing: StoredCertificate[],
  incoming: Array<{ name: string; url: string; isActive?: boolean }>
): StoredCertificate[] {
  const now = new Date().toISOString();
  return incoming.map((inc) => {
    const found = existing.find((e) => e.url === inc.url);
    if (found) {
      const changed = found.name !== inc.name || found.isActive !== (inc.isActive ?? found.isActive);
      return { name: inc.name, url: inc.url, isActive: inc.isActive ?? found.isActive, updatedAt: changed ? now : found.updatedAt };
    }
    return { name: inc.name, url: inc.url, updatedAt: now, isActive: inc.isActive ?? true };
  });
}

function includeShape() {
  return {
    experienceSkills: { include: { skill: { select: { id: true, skill: true } } } },
  } as const;
}

function shapeExperience(raw: {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string | null;
  durationFrom: Date;
  durationTo: Date | null;
  activeJob: boolean;
  description: string | null;
  certificates: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  experienceSkills: { skill: { id: string; skill: string } }[];
}) {
  const { experienceSkills, ...fields } = raw;
  return { ...fields, skills: experienceSkills.map((es) => es.skill) };
}

export async function listExperience(userId: string, query: Record<string, unknown>) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { userId };
  const [raw, total] = await Promise.all([
    prisma.experience.findMany({ where, skip, take, orderBy: { durationFrom: "desc" }, include: includeShape() }),
    prisma.experience.count({ where }),
  ]);
  return paginatedData(raw.map(shapeExperience), total, page, limit);
}

export async function getExperience(userId: string, experienceId: string) {
  const raw = await prisma.experience.findFirst({
    where: { id: experienceId, userId },
    include: includeShape(),
  });
  if (!raw) throw new ApiError(404, "NOT_FOUND", "Experience not found");
  return shapeExperience(raw);
}

export async function createExperience(userId: string, input: CreateExperienceInput) {
  assertDuration(input.activeJob, input.durationFrom, input.durationTo ?? null);
  const skillIds = input.skillIds ?? [];
  await assertSkillReferences(userId, skillIds);

  const id = generateId();
  const certificates = buildCertificatesForInsert(input.certificates ?? []);

  await prisma.$transaction(async (tx) => {
    await tx.experience.create({
      data: {
        id,
        userId,
        title: input.title,
        company: input.company,
        location: input.location ?? null,
        durationFrom: new Date(input.durationFrom),
        durationTo: input.durationTo ? new Date(input.durationTo) : null,
        activeJob: input.activeJob,
        description: input.description ?? null,
        certificates: certificates as unknown as Prisma.InputJsonValue,
      },
    });
    if (skillIds.length > 0) {
      await tx.experienceSkill.createMany({
        data: skillIds.map((skillId) => ({ experienceId: id, skillId })),
      });
    }
  });

  const raw = await prisma.experience.findUniqueOrThrow({ where: { id }, include: includeShape() });
  return shapeExperience(raw);
}

export async function updateExperience(userId: string, experienceId: string, input: UpdateExperienceInput) {
  const existing = await prisma.experience.findFirst({ where: { id: experienceId, userId } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Experience not found");

  assertDuration(input.activeJob, input.durationFrom, input.durationTo ?? null);
  const skillIds = input.skillIds ?? [];
  await assertSkillReferences(userId, skillIds);

  const existingCerts = (existing.certificates as unknown as StoredCertificate[]) ?? [];
  const certificates = mergeCertificates(existingCerts, input.certificates ?? []);

  await prisma.$transaction(async (tx) => {
    await tx.experience.update({
      where: { id: experienceId },
      data: {
        title: input.title,
        company: input.company,
        location: input.location ?? null,
        durationFrom: new Date(input.durationFrom),
        durationTo: input.durationTo ? new Date(input.durationTo) : null,
        activeJob: input.activeJob,
        description: input.description ?? null,
        certificates: certificates as unknown as Prisma.InputJsonValue,
      },
    });
    await tx.experienceSkill.deleteMany({ where: { experienceId } });
    if (skillIds.length > 0) {
      await tx.experienceSkill.createMany({
        data: skillIds.map((skillId) => ({ experienceId, skillId })),
      });
    }
  });

  const raw = await prisma.experience.findUniqueOrThrow({ where: { id: experienceId }, include: includeShape() });
  return shapeExperience(raw);
}

export async function deleteExperience(userId: string, experienceId: string) {
  const existing = await prisma.experience.findFirst({ where: { id: experienceId, userId } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Experience not found");
  await prisma.experience.delete({ where: { id: experienceId } });
}
