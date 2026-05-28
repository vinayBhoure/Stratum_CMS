import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { PublicProjectsQuery, PublicLimitQuery } from "../validators/public.schema";

export async function assertUserExists(userId: string): Promise<void> {
  const user = await prisma.auth.findUnique({ where: { userId }, select: { userId: true } });
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "no user found");
  }
}

export async function getPublicUserInfo(userId: string) {
  const profile = await prisma.userInformation.findUnique({
    where: { userId },
    select: {
      name: true,
      email: true,
      contactNumber: true,
      address: true,
      googleLocationLink: true,
      socialMediaLinks: true,
    },
  });
  return profile ?? null;
}

export async function getPublicProjects(userId: string, query: PublicProjectsQuery) {
  const where: Prisma.ProjectWhereInput = {
    userId,
    ...(query.tag
      ? { projectTags: { some: { tag: { name: query.tag } } } }
      : {}),
  };

  const raw = await prisma.project.findMany({
    where,
    take: query.limit,
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      description: true,
      mediaUrl: true,
      githubLink: true,
      liveLink: true,
      projectSkills: { select: { skill: { select: { skill: true } } } },
      projectTags: { select: { tag: { select: { name: true } } } },
    },
  });

  return raw.map((p) => ({
    title: p.title,
    description: p.description,
    mediaUrl: p.mediaUrl,
    githubLink: p.githubLink,
    liveLink: p.liveLink,
    skills: p.projectSkills.map((ps) => ps.skill.skill),
    tags: p.projectTags.map((pt) => pt.tag.name),
  }));
}

interface StoredCertificate {
  name: string;
  url: string;
  updatedAt: string;
  isActive: boolean;
}

export async function getPublicExperience(userId: string, query: PublicLimitQuery) {
  const raw = await prisma.experience.findMany({
    where: { userId },
    take: query.limit,
    orderBy: { durationFrom: "desc" },
    select: {
      title: true,
      company: true,
      location: true,
      durationFrom: true,
      durationTo: true,
      activeJob: true,
      description: true,
      certificates: true,
      experienceSkills: { select: { skill: { select: { skill: true } } } },
    },
  });

  return raw.map((e) => {
    const allCerts = (e.certificates as unknown as StoredCertificate[]) ?? [];
    return {
      title: e.title,
      company: e.company,
      location: e.location,
      durationFrom: e.durationFrom,
      durationTo: e.durationTo,
      activeJob: e.activeJob,
      description: e.description,
      certificates: allCerts
        .filter((c) => c.isActive)
        .map(({ name, url }) => ({ name, url })),
      skills: e.experienceSkills.map((es) => es.skill.skill),
    };
  });
}

export async function getPublicSkills(userId: string, query: PublicLimitQuery) {
  const items = await prisma.skill.findMany({
    where: { userId },
    take: query.limit,
    orderBy: { skill: "asc" },
    select: { skill: true },
  });
  return items.map((s) => s.skill);
}

export async function getPublicTags(userId: string, query: PublicLimitQuery) {
  const items = await prisma.tag.findMany({
    where: { projectTags: { some: { project: { userId } } } },
    take: query.limit,
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return items.map((t) => t.name);
}

export async function getPublicResume(userId: string) {
  const resume = await prisma.resume.findUnique({
    where: { userId },
    select: { url: true },
  });
  return resume ?? null;
}
