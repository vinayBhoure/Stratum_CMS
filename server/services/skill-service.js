const prisma = require('../lib/prisma');

/**
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
async function list(userId) {
  return prisma.skill.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, createdAt: true },
  });
}

/**
 * @param {string} userId
 * @param {{ name: string }} data
 * @returns {Promise<Object>}
 */
async function create(userId, data) {
  return prisma.skill.create({
    data: { userId, name: data.name },
    select: { id: true, name: true, createdAt: true },
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @param {{ name: string }} data
 * @returns {Promise<Object|null>}
 */
async function update(id, userId, data) {
  return prisma.skill.updateMany({
    where: { id, userId },
    data: { name: data.name },
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function remove(id, userId) {
  return prisma.skill.deleteMany({ where: { id, userId } });
}

module.exports = { list, create, update, remove };
