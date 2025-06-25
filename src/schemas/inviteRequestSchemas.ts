import { z } from "zod";

// For GET /invite?inviteId=...
export const getInviteQuerySchema = z.object({
  inviteId: z
    .string()
    .length(6, { message: "Invite ID must be exactly 6 characters" })
    .regex(/^[a-zA-Z0-9]{6}$/, { message: "Invite ID must be alphanumeric" }),
});

// For POST /invite/create with { groupName }
export const postInviteBodySchema = z.object({
  groupName: z.string().nonempty({ message: "Name is required" }),
});
