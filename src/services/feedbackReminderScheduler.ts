import { getRalliesNeedingFeedbackReminder, updateRallyStatus } from "../models/RallyModel";
import { getParticipantPhonesForRally } from "../models/ParticipantModel";
import { sendFeedbackReminder } from "./feedbackReminder";
import { decryptPhoneNumber } from "../utils/security";
import { config } from "../config/config";

const INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

async function processFeedbackReminders() {
  try {
    const rallies = await getRalliesNeedingFeedbackReminder();

    for (const rally of rallies) {
      try {
        const participants = await getParticipantPhonesForRally(rally.id);

        for (const p of participants) {
          try {
            const phone = decryptPhoneNumber(p.encryptedPhoneNumber);
            await sendFeedbackReminder(phone, rally.hexId, rally.groupName, config.clientUrl);
          } catch (err) {
            console.error(`Failed to send feedback reminder to participant ${p.participantId}:`, err);
          }
        }

        await updateRallyStatus(rally.id, "completed");
        console.log(`Sent feedback reminders for rally ${rally.hexId} (${rally.groupName})`);
      } catch (err) {
        console.error(`Failed to process feedback reminders for rally ${rally.hexId}:`, err);
      }
    }
  } catch (err) {
    console.error("Feedback reminder scheduler error:", err);
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startFeedbackReminderScheduler() {
  console.log("Starting feedback reminder scheduler (every 5 minutes)");
  processFeedbackReminders();
  intervalId = setInterval(processFeedbackReminders, INTERVAL_MS);
}

export function stopFeedbackReminderScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
