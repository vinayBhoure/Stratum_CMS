import { z } from "zod";

const certificateInputSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    url: z.string().url(),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const createExperienceSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    company: z.string().trim().min(1).max(200),
    location: z.string().max(200).optional().nullable(),
    durationFrom: z.string().datetime({ offset: true }).or(z.string().date()),
    durationTo: z.string().datetime({ offset: true }).or(z.string().date()).optional().nullable(),
    activeJob: z.boolean(),
    description: z.string().max(10000).optional().nullable(),
    certificates: z.array(certificateInputSchema).optional().default([]),
    skillIds: z.array(z.string()).optional().default([]),
  })
  .strict();

export const updateExperienceSchema = createExperienceSchema;

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type CertificateInput = z.infer<typeof certificateInputSchema>;
