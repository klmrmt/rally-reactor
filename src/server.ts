import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import { config } from "./config/config";
import { runMigrations } from "./migrate";
import { startFeedbackReminderScheduler } from "./services/feedbackReminderScheduler";
import { startVotingAutoCloseScheduler } from "./services/votingAutoCloseScheduler";
const PORT = config.port || 3000;

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      startFeedbackReminderScheduler();
      startVotingAutoCloseScheduler();
    });
  })
  .catch((err) => {
    console.error("Migration failed, server not started:", err);
    process.exit(1);
  });
