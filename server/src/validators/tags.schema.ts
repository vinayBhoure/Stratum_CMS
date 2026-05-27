import { z } from "zod";

const tagNameRule = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-z0-9-]+$/, "Tag name must be lowercase letters, numbers, or hyphens only");

export const createTagSchema = z
  .object({
    name: tagNameRule,
  })
  .strict();

export const updateTagSchema = z
  .object({
    name: tagNameRule,
  })
  .strict();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
