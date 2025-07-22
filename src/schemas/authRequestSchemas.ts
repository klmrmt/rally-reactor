/**
 * This file contains schemas for authentication requests using Zod.
 * It defines the structure and validation rules for the request bodies
 * for sending and verifying OTPs.
 */
import { z } from "zod";

// E.164 phone number : Example: +1234567890
const phoneNumberSchema = z.string().regex(/^\+[1-9]\d{1,14}$/, {
  message: "Invalid phone number format. Must be E.164 (e.g., +1234567890)",
});

// 6 digit MFA code
const mfaCodeSchema = z.union([
  z.string().regex(/^\d{6}$/, { message: "MFA code must be a 6-digit number" }),
  z.number().refine((val) => /^\d{6}$/.test(String(val)), {
    message: "MFA code must be a 6-digit number",
  }),
]);

export const sendOTPBodySchema = z.object({
  phoneNumber: phoneNumberSchema,
});
export type SendOTPBody = z.infer<typeof sendOTPBodySchema>;

export const verifyOTPBodySchema = z.object({
  phoneNumber: phoneNumberSchema,
  mfaCode: mfaCodeSchema,
});
export type VerifyOTPBody = z.infer<typeof verifyOTPBodySchema>;
