import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import { config } from "./config/config";
import { startFeedbackReminderScheduler } from "./services/feedbackReminderScheduler";
import { startVotingAutoCloseScheduler } from "./services/votingAutoCloseScheduler";
const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  startFeedbackReminderScheduler();
  startVotingAutoCloseScheduler();
});
