import { Request, Response } from "express";
import { generateToken } from "../../auth/jwt/jwt";
import {
  sendVerificationCode,
  validateVerificationCode,
} from "../../auth/twilio/twilio";
import { createUser, getUserIdByPhoneHash, getUserFullById } from "../../models/UserModel";
import {
  AuthenticationResponse,
  RequestResponse,
} from "../../utils/apiResponse";
import { encryptPhoneNumber, hashPhoneNumber } from "../../utils/security";
import { SendOTPBody, VerifyOTPBody } from "../../schemas/authRequestSchemas";

export const sendOTP = async (
  req: Request & { body: SendOTPBody },
  res: Response
) => {
  const { phoneNumber } = req.body || {};
  try {
    const response = await sendVerificationCode(phoneNumber);
    if (response.status === "pending" || response.status === "approved") {
      RequestResponse(res, 200, true, "MFA code sent successfully");
    } else {
      console.error("[MFA SEND ERROR]", {
        phoneNumber,
        error: response,
      });
      RequestResponse(res, 500, false, "Failed to send MFA code");
    }
  } catch (error) {
    console.error("[MFA SEND ERROR]", {
      phoneNumber,
      error: error instanceof Error ? error.message : error,
    });
    RequestResponse(res, 500, false, "Error sending MFA code");
  }
};

const getOrCreateUser = async (phoneNumber: string) => {
  const hashedPhoneNumber = hashPhoneNumber(phoneNumber);
  const existing = await getUserIdByPhoneHash(hashedPhoneNumber);
  if (existing) {
    return getUserFullById(existing.user_id);
  }
  const lastFour = phoneNumber.slice(-4);
  const defaultName = `User ${lastFour}`;
  const encryptedPhoneNumber = encryptPhoneNumber(phoneNumber);
  const created = await createUser(
    hashedPhoneNumber,
    encryptedPhoneNumber,
    undefined,
    undefined,
    defaultName
  );
  return getUserFullById(created.user_id);
};

export const verifyOTP = async (
  req: Request & { body: VerifyOTPBody },
  res: Response
) => {
  const { phoneNumber, mfaCode } = req.body || {};
  try {
    const verificationResult = await validateVerificationCode(
      phoneNumber,
      mfaCode
    );
    if (verificationResult.status !== "approved") {
      RequestResponse(res, 401, false, "Incorrect MFA code");
      return;
    }

    const user = await getOrCreateUser(phoneNumber);
    if (!user) {
      RequestResponse(res, 500, false, "Failed to retrieve or create user");
      return;
    }

    const bearerToken = generateToken(user.userId);
    RequestResponse(res, 200, true, "MFA code verified successfully", {
      token: bearerToken,
      user: {
        userId: user.userId,
        displayName: user.displayName,
      },
    } as AuthenticationResponse);
  } catch (error) {
    console.error("[MFA VERIFY ERROR]", {
      phoneNumber,
      error,
    });
    RequestResponse(res, 500, false, "Error verifying MFA code");
  }
};
