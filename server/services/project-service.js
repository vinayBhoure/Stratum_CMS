const prisma = require('../lib/prisma');

const PROJECT_SELECT = {
  id: true,
  title: true,
  description: true,
  mediaUrl: true,
  githubUrl: true,
  liveUrl: true,
  createdAt: true,
  updatedAt: true,
  projectTags: { select: { tag: { select: { id: true, name: true } } } },
  projectSkills: { select: { skill: { select: { id: true, name: true } } } },
};

/**
 * Find-or-creates Tag rows for each name, returns their IDs.
 * Runs inside a transaction context.
 *
 * @param {import('../generated/prisma').PrismaClient} tx
 * @param {string[]} tagNames
 * @returns {Promise<string[]>}
 */
async function resolveTagIds(tx, tagNames) {
  const tags = await Promise.all(
    tagNames.map((name) =>
      tx.tag.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      })
    )
  );
  return tags.map((t) => t.id);
}

/**
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
async function list(userId) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: PROJECT_SELECT,
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getById(id, userId) {
  return prisma.project.findFirst({ where: { id, userId }, select: PROJECT_SELECT });
}

/**
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function create(userId, data) {
  const { tags = [], skillIds = [], ...fields } = data;

  return prisma.$transaction(async (tx) => {
    const tagIds = await resolveTagIds(tx, tags);

    return tx.project.create({
      data: {
        ...fields,
        userId,
        projectTags: { create: tagIds.map((tagId) => ({ tagId })) },
        projectSkills: { create: skillIds.map((skillId) => ({ skillId })) },
      },
      select: PROJECT_SELECT,
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
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) { return null; }

  const { tags = [], skillIds = [], ...fields } = data;

  return prisma.$transaction(async (tx) => {
    await tx.projectTag.deleteMany({ where: { projectId: id } });
    await tx.projectSkill.deleteMany({ where: { projectId: id } });

    const tagIds = await resolveTagIds(tx, tags);

    return tx.project.update({
      where: { id },
      data: {
        ...fields,
        projectTags: { create: tagIds.map((tagId) => ({ tagId })) },
        projectSkills: { create: skillIds.map((skillId) => ({ skillId })) },
      },
      select: PROJECT_SELECT,
    });
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function remove(id, userId) {
  const result = await prisma.project.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

module.exports = { list, getById, create, update, remove };
