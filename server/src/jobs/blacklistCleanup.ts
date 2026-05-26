import { prisma } from "../config/prisma";

const TOKEN_TTL_DAYS = 7;

// Removes blacklist entries older than the JWT lifetime — once a token would
// have expired on its own, keeping it blacklisted serves no purpose.
// Scheduling (node-cron) is wired during the Phase 6 security pass; this
// function is intentionally callable in isolation until then.
export async function cleanupBlacklist(): Promise<number> {
  const cutoff = new Date(Date.now() - TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.tokenBlacklist.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return count;
}
