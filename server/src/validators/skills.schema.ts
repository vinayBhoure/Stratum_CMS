import { z } from "zod";

export const createSkillSchema = z
  .object({
    skill: z.string().trim().min(1).max(50),
  })
  .strict();

export const updateSkillSchema = z
  .object({
    skill: z.string().trim().min(1).max(50),
  })
  .strict();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
