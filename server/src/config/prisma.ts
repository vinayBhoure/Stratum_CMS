import { PrismaClient } from "@prisma/client";

// Single PrismaClient instance shared across the app (PrismaService singleton).
// Never instantiate a new PrismaClient elsewhere.
export const prisma = new PrismaClient();
