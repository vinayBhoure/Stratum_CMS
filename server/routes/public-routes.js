const express = require('express');
const asyncHandler = require('../utils/async-handler');
const { sendSuccess, sendError } = require('../utils/response');
const { getByUsername } = require('../services/user-service');
const prisma = require('../lib/prisma');

const router = express.Router();

/**
 * Resolves :username to a userId, or sends 404.
 * Attaches userId to req for downstream handlers.
 */
async function resolveUser(req, res, next) {
  const user = await getByUsername(req.params.username);
  if (!user) { return sendError(res, 'NOT_FOUND', 'User not found', 404); }
  req.publicUserId = user.id;
  next();
}

router.get(
  '/:username/projects',
  asyncHandler(resolveUser),
  asyncHandler(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: { userId: req.publicUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, description: true,
        mediaUrl: true, githubUrl: true, liveUrl: true, createdAt: true,
        projectTags: { select: { tag: { select: { id: true, name: true } } } },
        projectSkills: { select: { skill: { select: { id: true, name: true } } } },
      },
    });
    sendSuccess(res, projects);
  })
);

router.get(
  '/:username/experience',
  asyncHandler(resolveUser),
  asyncHandler(async (req, res) => {
    const experience = await prisma.experience.findMany({
      where: { userId: req.publicUserId },
      orderBy: { startDate: 'desc' },
      select: {
        id: true, company: true, role: true,
        startDate: true, endDate: true, description: true, createdAt: true,
        experienceSkills: { select: { skill: { select: { id: true, name: true } } } },
      },
    });
    sendSuccess(res, experience);
  })
);

router.get(
  '/:username/skills',
  asyncHandler(resolveUser),
  asyncHandler(async (req, res) => {
    const skills = await prisma.skill.findMany({
      where: { userId: req.publicUserId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, createdAt: true },
    });
    sendSuccess(res, skills);
  })
);

router.get(
  '/:username/contact',
  asyncHandler(resolveUser),
  asyncHandler(async (req, res) => {
    const contact = await prisma.contact.findUnique({
      where: { userId: req.publicUserId },
      select: {
        id: true, name: true, email: true,
        mobile: true, address: true, googleMapsUrl: true,
      },
    });
    const social = await prisma.socialAccount.findMany({
      where: { userId: req.publicUserId },
      select: { id: true, platform: true, url: true },
    });
    sendSuccess(res, { contact: contact ?? null, socialAccounts: social });
  })
);

router.get(
  '/:username/resume',
  asyncHandler(resolveUser),
  asyncHandler(async (req, res) => {
    const resume = await prisma.resume.findUnique({
      where: { userId: req.publicUserId },
      select: { id: true, name: true, pdfUrl: true, updatedAt: true },
    });
    if (!resume) { return sendError(res, 'NOT_FOUND', 'Resume not found', 404); }
    sendSuccess(res, resume);
  })
);

module.exports = router;
