import { z } from "zod";

export const getRallySchema = z.object({
  rallyId: z
    .string()
    .length(6, { message: "Invite ID must be exactly 6 characters" })
    .regex(/^[A-Z0-9]{6}$/, { message: "Invite ID must be alphanumeric" }),
});
export type GetRallyType = z.infer<typeof getRallySchema>;

export const createRallySchema = z.object({
  groupName: z.string().nonempty({ message: "Name is required" }),
  callToRally: z
    .string()
    .max(100, { message: "Call to rally must be at most 100 characters" })
    .optional(),
  hangoutDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Must be a valid ISO 8601 date string.",
    })
    .refine((val) => Date.parse(val) > Date.now(), {
      message: "Hangout date and time must be in the future.",
    }),
  location: z
    .string()
    .max(200, { message: "Location must be at most 200 characters" })
    .optional(),
  radiusMiles: z
    .number()
    .min(0.5, { message: "Radius must be at least 0.5 miles" })
    .max(50, { message: "Radius must be at most 50 miles" })
    .optional(),
  latitude: z
    .number()
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" })
    .optional(),
  longitude: z
    .number()
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" })
    .optional(),
  votingDurationMinutes: z
    .number()
    .min(5, { message: "Voting duration must be at least 5 minutes" })
    .max(1440, { message: "Voting duration must be at most 24 hours" })
    .optional(),
  draftId: z.string().uuid().optional(),
});
export type CreateRallyType = z.infer<typeof createRallySchema>;

export const updateRallySchema = z.object({
  groupName: z.string().nonempty().optional(),
  callToRally: z.string().max(100).optional(),
  hangoutDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." })
    .refine((val) => Date.parse(val) > Date.now(), { message: "Date must be in the future." })
    .optional(),
  location: z.string().max(200).nullable().optional(),
  radiusMiles: z.number().min(0.5).max(50).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});
export type UpdateRallyType = z.infer<typeof updateRallySchema>;
