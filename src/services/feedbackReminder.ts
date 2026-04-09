import { Twilio } from "twilio";
import { config } from "../config/config";

const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);

export const sendFeedbackReminder = async (
  phoneNumber: string,
  rallyHexId: string,
  groupName: string,
  clientUrl: string
): Promise<void> => {
  const link = `${clientUrl}/${rallyHexId}/result`;

  await client.messages.create({
    body: `Hey! How was "${groupName}"? Tap to leave quick feedback: ${link}`,
    from: config.twilio.messagingPhone,
    to: phoneNumber,
  });
};

export const sendLocationDecidedNotification = async (
  phoneNumber: string,
  rallyHexId: string,
  groupName: string,
  locationName: string,
  clientUrl: string
): Promise<void> => {
  const link = `${clientUrl}/${rallyHexId}/result`;

  await client.messages.create({
    body: `"${groupName}" is set! You're heading to ${locationName}. Details: ${link}`,
    from: config.twilio.messagingPhone,
    to: phoneNumber,
  });
};
