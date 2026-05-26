import { z } from "zod";

// Constraints mirror api_contracts.md §3 exactly. Frontend validators must
// mirror this file (deferred — frontend auth screens are a later phase).

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const signupSchema = z
  .object({
    email: z.string().email(),
    password: passwordRule,
    name: z.string().trim().min(1).max(100),
  })
  .strict();

// Login does not re-enforce password complexity — it only checks presence, so
// the rules aren't leaked and legacy passwords still authenticate.
export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
