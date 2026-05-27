import { z } from "zod";

export const createProjectSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(5000).optional().nullable(),
    mediaUrl: z.string().url().optional().nullable(),
    githubLink: z.string().url().optional().nullable(),
    liveLink: z.string().url().optional().nullable(),
    skillIds: z.array(z.string()).optional().default([]),
    tagIds: z.array(z.string()).optional().default([]),
  })
  .strict();

export const updateProjectSchema = createProjectSchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
