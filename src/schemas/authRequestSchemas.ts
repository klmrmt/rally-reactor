import { z } from "zod";

export const phoneNumberSchema = z.string().regex(/^\+[1-9]\d{1,14}$/, {
  message: "Invalid phone number format. Must be E.164 (e.g., +1234567890)",
});

export const mfaCodeSchema = z.union([
  z.string().regex(/^\d{6}$/, { message: "MFA code must be a 6-digit number" }),
  z.number().refine((val) => /^\d{6}$/.test(String(val)), {
    message: "MFA code must be a 6-digit number",
  }),
]);

// For POST /auth/send-otp with { phoneNumber }
export const sendOTPBodySchema = z.object({
  phoneNumber: phoneNumberSchema,
});

// For POST /auth/verify-otp with { phoneNumber, mfaCode }
export const verifyOTPBodySchema = z.object({
  phoneNumber: phoneNumberSchema,
  mfaCode: mfaCodeSchema,
});

export type SendOTPBody = z.infer<typeof sendOTPBodySchema>;
export type VerifyOTPBody = z.infer<typeof verifyOTPBodySchema>;
