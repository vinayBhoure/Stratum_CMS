const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { clerkClient } = require('../config/clerk');
const prisma = require('../lib/prisma');

/**
 * Resolves the Clerk session to a local User row (sync-on-request).
 * Runs after ClerkExpressRequireAuth has populated req.auth.userId.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function syncUser(req, res, next) {
  try {
    const clerkId = req.auth?.userId;

    let user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
      const username = clerkUser.username ?? email.split('@')[0];

      user = await prisma.user.upsert({
        where: { clerkId },
        update: { email },
        create: { clerkId, email, username, password: '' },
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      clerkId: user.clerkId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

// Export as array so routes can spread it: router.post('/x', ...requireAuth, handler)
module.exports = [ClerkExpressRequireAuth(), syncUser];
