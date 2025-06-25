import { Twilio } from "twilio";
import { config } from "../../config/config";

// Initialize Twilio client
// The client is initialized with the account SID and auth token from the config file.
// This client will be used to interact with Twilio's services, such as sending and validating verification codes.
const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);

// Function to send a verification code via SMS using Twilio Verify service
export const sendVerificationCode = async (phoneNumberToSendTo: string) => {
  const verificationCodeResponse = await client.verify.v2
    .services(config.twilio.verificationServiceSid)
    .verifications.create({
      to: phoneNumberToSendTo,
      channel: "sms",
    });
  return verificationCodeResponse;
};

// Function to validate the verification code entered by the user
export const validateVerificationCode = async (
  phoneNumber: string,
  code: string
) => {
  const verificationCheck = await client.verify.v2
    .services(config.twilio.verificationServiceSid)
    .verificationChecks.create({
      to: phoneNumber,
      code: code,
    });
  return verificationCheck;
};
