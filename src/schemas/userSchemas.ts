import { z } from "zod";

export const updateMeSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(30, "Display name must be 30 characters or fewer")
    .trim(),
});

export type UpdateMeBody = z.infer<typeof updateMeSchema>;
