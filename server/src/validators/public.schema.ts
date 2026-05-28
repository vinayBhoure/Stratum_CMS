import { z } from "zod";

export const publicUserIdSchema = z.object({
  userId: z.string().length(12),
});

export const publicLimitQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().positive().optional()),
});

export const publicProjectsQuerySchema = publicLimitQuerySchema.extend({
  tag: z.string().min(1).optional(),
});

export type PublicUserIdParams = z.infer<typeof publicUserIdSchema>;
export type PublicLimitQuery = z.infer<typeof publicLimitQuerySchema>;
export type PublicProjectsQuery = z.infer<typeof publicProjectsQuerySchema>;
