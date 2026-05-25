import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function start(): Promise<void> {
  await prisma.$connect();

  app.listen(env.serverPort, () => {
    // eslint-disable-next-line no-console
    console.log(`Stratum CMS server listening on http://localhost:${env.serverPort}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
