/**
 * Clerk authentication SDK configuration.
 * Clerk auto-reads CLERK_SECRET_KEY from process.env.
 *
 * @module config/clerk
 */

const { clerkClient } = require('@clerk/clerk-sdk-node');

module.exports = { clerkClient };
