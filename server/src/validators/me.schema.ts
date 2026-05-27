import { z } from "zod";

// Mirrors api_contracts.md §4.2. All fields except name are nullable/optional.
const contactNumberSchema = z
  .object({
    countryCode: z.string().min(1).max(10),
    number: z.string().min(1).max(20),
  })
  .strict();

const socialMediaLinksSchema = z.record(z.string(), z.string().url()).optional();

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().email().optional().nullable(),
    contactNumber: contactNumberSchema.optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    googleLocationLink: z.string().url().optional().nullable(),
    socialMediaLinks: socialMediaLinksSchema.nullable(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
