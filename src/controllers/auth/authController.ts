import { Request, Response } from "express";
import { generateToken } from "../../auth/jwt/jwt";
import {
  sendVerificationCode,
  validateVerificationCode,
} from "../../auth/twilio/twilio";
import { createUser, getUserIdByPhoneHash } from "../../models/UserModel";
import {
  AuthenticationResponse,
  RequestResponse,
} from "../../utils/apiResponse";
import { encryptPhoneNumber, hashPhoneNumber } from "../../utils/security";
import { SendOTPBody, VerifyOTPBody } from "../../schemas/authRequestSchemas";

// Controller to create and send MFA code via SMS
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

// Helper function to return a user ID if the user exists, or create a new user if not
// This UUID will be added to the JWT token payload
const getUserId = async (phoneNumber: string) => {
  const hashedPhoneNumber = hashPhoneNumber(phoneNumber);
  const existingUserId = await getUserIdByPhoneHash(hashedPhoneNumber);
  if (existingUserId) {
    return existingUserId;
  }
  const encryptedPhoneNumber = encryptPhoneNumber(phoneNumber);
  const createdUser = await createUser(
    hashedPhoneNumber,
    encryptedPhoneNumber,
    undefined, // profilePictureUrl
    undefined, // bio
    undefined // displayName
  );
  return createdUser.user_id;
};

// Controller to verify the MFA code entered by the user
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
    const textResponseStatus = verificationResult.status;
    if (textResponseStatus !== "approved") {
      RequestResponse(res, 401, false, "Incorrect MFA code");
      return;
    } else {
      let userId: string | undefined = await getUserId(phoneNumber);
      if (!userId) {
        RequestResponse(res, 500, false, "Failed to retrieve or create user");
        return;
      }

      // Generate JWT token with user ID
      const bearerToken = generateToken(userId);
      RequestResponse(res, 200, true, "MFA code verified successfully", {
        token: bearerToken,
      } as AuthenticationResponse);
      return;
    }
  } catch (error) {
    console.error("[MFA VERIFY ERROR]", {
      phoneNumber,
      error: error,
    });
    RequestResponse(res, 500, false, "Error verifying MFA code");
    return;
  }
};
