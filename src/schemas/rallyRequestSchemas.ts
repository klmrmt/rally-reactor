import { z } from "zod";

// For GET /invite?inviteId=...
export const getRallySchema = z.object({
  rallyId: z
    .string()
    .length(6, { message: "Invite ID must be exactly 6 characters" })
    .regex(/^[A-Z0-9]{6}$/, { message: "Invite ID must be alphanumeric" }),
});
export type GetRallyType = z.infer<typeof getRallySchema>;

// For POST /invite/create with { groupName }
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
});
export type CreateRallyType = z.infer<typeof createRallySchema>;
