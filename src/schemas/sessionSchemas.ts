import { z } from "zod";

const VALID_VIBES = ["chill", "active", "drinks", "food", "outdoors"] as const;

export const joinRallySchema = z.object({
  displayName: z
    .string()
    .max(30, { message: "Display name must be at most 30 characters" })
    .optional(),
});
export type JoinRallyType = z.infer<typeof joinRallySchema>;

export const hexIdParamSchema = z.object({
  hexId: z
    .string()
    .length(6, { message: "Rally ID must be exactly 6 characters" })
    .regex(/^[A-Z0-9]{6}$/, { message: "Rally ID must be alphanumeric" }),
});

export const constraintVoteSchema = z.object({
  budget: z.enum(["$", "$$", "$$$"], {
    errorMap: () => ({ message: "Budget must be $, $$, or $$$" }),
  }),
  vibes: z
    .array(z.enum(VALID_VIBES))
    .min(1, { message: "Select at least 1 vibe" })
    .max(2, { message: "Select at most 2 vibes" }),
  distance: z.enum(["walk", "short_drive", "anywhere"], {
    errorMap: () => ({
      message: "Distance must be walk, short_drive, or anywhere",
    }),
  }),
});
export type ConstraintVoteType = z.infer<typeof constraintVoteSchema>;

export const finalVoteSchema = z.object({
  recommendationId: z.string().uuid({ message: "Invalid recommendation ID" }),
});
export type FinalVoteType = z.infer<typeof finalVoteSchema>;

export const selectWinnerSchema = z.object({
  recommendationId: z.string().uuid({ message: "Invalid recommendation ID" }),
});
export type SelectWinnerType = z.infer<typeof selectWinnerSchema>;

export const feedbackSchema = z.object({
  liked: z.boolean(),
  tags: z
    .array(
      z.enum([
        "too_expensive",
        "too_crowded",
        "fun_vibe",
        "great_pick",
        "meh",
      ])
    )
    .default([]),
});
export type FeedbackType = z.infer<typeof feedbackSchema>;
