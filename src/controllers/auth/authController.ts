import { Request, Response } from "express";
import {
  sendVerificationCode,
  validateVerificationCode,
} from "../../auth/twilio/twilio";
import {
  AuthenticationResponse,
  RequestResponse,
} from "../../utils/apiResponse";
import { generateToken } from "../../auth/jwt/jwt";
import {
  validateMFACode,
  validatePhoneNumber,
} from "../../utils/verifyAuthRequests";

// Controller to create and send MFA code via SMS
export const sendOTP = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body || {};
  if (!validatePhoneNumber(phoneNumber)) {
    RequestResponse(
      res,
      400,
      false,
      "Invalid phone number format or phone number"
    );
    return;
  }

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

// Controller to verify the MFA code entered by the user
export const verifyOTP = async (req: Request, res: Response) => {
  const { phoneNumber, mfaCode } = req.body || {};
  if (!validatePhoneNumber(phoneNumber)) {
    RequestResponse(
      res,
      400,
      false,
      "Invalid phone number format or phone number"
    );
    return;
  }
  if (!validateMFACode(mfaCode)) {
    RequestResponse(res, 400, false, "Invalid MFA code format or MFA code");
    return;
  }

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
      const bearerToken = generateToken(phoneNumber);
      RequestResponse(res, 200, true, "MFA code verified successfully", {
        token: bearerToken,
      } as AuthenticationResponse);
      return;
    }
  } catch (error) {
    console.error("[MFA VERIFY ERROR]", {
      phoneNumber,
      error: error instanceof Error ? error.message : error,
    });
    RequestResponse(res, 500, false, "Error verifying MFA code");
    return;
  }
};
