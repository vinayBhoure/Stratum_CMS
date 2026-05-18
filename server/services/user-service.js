const prisma = require('../lib/prisma');

/**
 * Finds a user by their Clerk ID, or creates them from Clerk user data.
 * Used by require-auth middleware (sync-on-request pattern).
 *
 * @param {string} clerkId
 * @param {{ email: string, username: string }} clerkData
 * @returns {Promise<Object>}
 */
async function upsertFromClerk(clerkId, clerkData) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email: clerkData.email },
    create: {
      clerkId,
      email: clerkData.email,
      username: clerkData.username,
      password: '',
    },
  });
}

/**
 * Finds a user by username for public API lookups.
 *
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function getByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, email: true },
  });
}

module.exports = { upsertFromClerk, getByUsername };
