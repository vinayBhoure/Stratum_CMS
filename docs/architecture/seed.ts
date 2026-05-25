// ============================================================================
// ⚠️ REFERENCE COPY ONLY — NOT the live seed.
// The authoritative seed is /server/prisma/seed.ts (run via `npx prisma db seed`
// from /server). This file is the frozen LLD reference and may drift.
// ============================================================================
// Stratum CMS — Prisma seed
// ----------------------------------------------------------------------------
// Seeds the single system tag "featured". Idempotent — safe to re-run.
// Run: npx prisma db seed
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  12
);

async function main() {
  // System tag: "featured"
  // userId = null marks it as system; users cannot delete it.
  const existing = await prisma.tag.findFirst({
    where: { userId: null, name: "featured" },
  });

  if (!existing) {
    await prisma.tag.create({
      data: {
        id: nanoid(),
        userId: null,
        name: "featured",
        isSystem: true,
      },
    });
    console.log("✓ Seeded system tag: featured");
  } else {
    console.log("→ System tag 'featured' already exists, skipping");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
