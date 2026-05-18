const prisma = require('../lib/prisma');

const CONTACT_SELECT = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  address: true,
  googleMapsUrl: true,
  createdAt: true,
  updatedAt: true,
};

const SOCIAL_SELECT = {
  id: true,
  platform: true,
  url: true,
  createdAt: true,
};

// ─── Contact (one per user — upsert) ─────────────────────────────────────────

/**
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getContact(userId) {
  return prisma.contact.findUnique({ where: { userId }, select: CONTACT_SELECT });
}

/**
 * Creates or fully replaces the user's contact record.
 *
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function upsertContact(userId, data) {
  return prisma.contact.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
    select: CONTACT_SELECT,
  });
}

/**
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function deleteContact(userId) {
  const result = await prisma.contact.deleteMany({ where: { userId } });
  return result.count > 0;
}

// ─── Social Accounts ──────────────────────────────────────────────────────────

/**
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
async function listSocial(userId) {
  return prisma.socialAccount.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: SOCIAL_SELECT,
  });
}

/**
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function createSocial(userId, data) {
  return prisma.socialAccount.create({
    data: { userId, ...data },
    select: SOCIAL_SELECT,
  });
}

/**
 * @param {string} id
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function updateSocial(id, userId, data) {
  const result = await prisma.socialAccount.updateMany({ where: { id, userId }, data });
  return result.count > 0;
}

/**
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function deleteSocial(id, userId) {
  const result = await prisma.socialAccount.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

module.exports = {
  getContact, upsertContact, deleteContact,
  listSocial, createSocial, updateSocial, deleteSocial,
};
