/**
 * This file contains schemas for creating and retrieving user preferences using Zod.
 * It defines the structure and validation rules for the request bodies
 * for creating and updating user preferences.
 */
import { z } from "zod";

export const createUserPreferencesSchema = z.object({
  rally_id: z
    .string()
    .length(6, { message: "Rally ID must be exactly 6 characters" })
    .regex(/^[A-Z0-9]{6}$/, { message: "Rally ID must be alphanumeric" }),
  cost_level: z.enum(["low", "medium", "high"], {
    message: "Cost level must be one of: low, medium, high",
  }),
  vibe: z.enum(["casual", "formal", "adventure", "relaxed", "energetic"], {
    message: "Vibe must be one of: casual, formal, adventure, relaxed, energetic",
  }),
  location_radius: z
    .number()
    .min(1, { message: "Location radius must be at least 1 mile" })
    .max(50, { message: "Location radius must be at most 50 miles" }),
});
export type CreateUserPreferencesType = z.infer<typeof createUserPreferencesSchema>;

export const getUserPreferencesSchema = z.object({
  rally_id: z
    .string()
    .length(6, { message: "Rally ID must be exactly 6 characters" })
    .regex(/^[A-Z0-9]{6}$/, { message: "Rally ID must be alphanumeric" }),
});
export type GetUserPreferencesType = z.infer<typeof getUserPreferencesSchema>; 