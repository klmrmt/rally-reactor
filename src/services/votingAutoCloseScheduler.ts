import db from "../db";
import { updateRallyStatus, type Rally } from "../models/RallyModel";
import { generateRecommendationsForRally } from "../ai/pipeline/recommendationPipeline";

const INTERVAL_MS = 60 * 1000; // Check every 60 seconds

async function getExpiredVotingRallies(): Promise<Pick<Rally, "id" | "hexId" | "groupName">[]> {
  const query = `
    SELECT id, hex_id, group_name
    FROM rallies
    WHERE status = 'voting'
      AND voting_closes_at IS NOT NULL
      AND voting_closes_at <= NOW()
  `;
  const result = await db.query(query);
  return result.rows.map((row) => ({
    id: row.id,
    hexId: row.hex_id,
    groupName: row.group_name,
  }));
}

async function processExpiredVoting() {
  try {
    const rallies = await getExpiredVotingRallies();

    for (const rally of rallies) {
      try {
        await updateRallyStatus(rally.id, "recommending");
        console.log(`Auto-closed voting for rally ${rally.hexId} (${rally.groupName})`);

        generateRecommendationsForRally(rally.id).catch((err) => {
          console.error(`Background recommendation generation failed for ${rally.hexId}:`, err);
        });
      } catch (err) {
        console.error(`Failed to auto-close voting for rally ${rally.hexId}:`, err);
      }
    }
  } catch (err) {
    console.error("Voting auto-close scheduler error:", err);
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startVotingAutoCloseScheduler() {
  console.log("Starting voting auto-close scheduler (every 60 seconds)");
  processExpiredVoting();
  intervalId = setInterval(processExpiredVoting, INTERVAL_MS);
}

export function stopVotingAutoCloseScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
