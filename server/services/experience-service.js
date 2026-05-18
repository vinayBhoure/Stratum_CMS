const prisma = require('../lib/prisma');

const EXPERIENCE_SELECT = {
  id: true,
  company: true,
  role: true,
  startDate: true,
  endDate: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  experienceSkills: { select: { skill: { select: { id: true, name: true } } } },
};

/**
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
async function list(userId) {
  return prisma.experience.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
    select: EXPERIENCE_SELECT,
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getById(id, userId) {
  return prisma.experience.findFirst({ where: { id, userId }, select: EXPERIENCE_SELECT });
}

/**
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function create(userId, data) {
  const { skillIds = [], ...fields } = data;

  return prisma.$transaction(async (tx) => {
    return tx.experience.create({
      data: {
        ...fields,
        userId,
        experienceSkills: { create: skillIds.map((skillId) => ({ skillId })) },
      },
      select: EXPERIENCE_SELECT,
    });
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
async function update(id, userId, data) {
  const existing = await prisma.experience.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) { return null; }

  const { skillIds = [], ...fields } = data;

  return prisma.$transaction(async (tx) => {
    await tx.experienceSkill.deleteMany({ where: { experienceId: id } });

    return tx.experience.update({
      where: { id },
      data: {
        ...fields,
        experienceSkills: { create: skillIds.map((skillId) => ({ skillId })) },
      },
      select: EXPERIENCE_SELECT,
    });
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function remove(id, userId) {
  const result = await prisma.experience.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

module.exports = { list, getById, create, update, remove };
