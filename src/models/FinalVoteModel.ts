import db from "../db";

export type FinalVote = {
  id: string;
  rallyId: string;
  participantId: string;
  recommendationId: string;
  votedAt: Date;
};

export type VoteTally = {
  recommendationId: string;
  count: number;
};

export const createFinalVote = async (
  rallyId: string,
  participantId: string,
  recommendationId: string
): Promise<FinalVote> => {
  const query = `
    INSERT INTO final_votes (rally_id, participant_id, recommendation_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (rally_id, participant_id) DO UPDATE SET
      recommendation_id = EXCLUDED.recommendation_id,
      voted_at = NOW()
    RETURNING id, rally_id, participant_id, recommendation_id, voted_at
  `;
  const result = await db.query(query, [
    rallyId,
    participantId,
    recommendationId,
  ]);
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    participantId: row.participant_id,
    recommendationId: row.recommendation_id,
    votedAt: row.voted_at,
  };
};

export const getVoteTallyByRallyId = async (
  rallyId: string
): Promise<VoteTally[]> => {
  const query = `
    SELECT recommendation_id, COUNT(*) as count
    FROM final_votes
    WHERE rally_id = $1
    GROUP BY recommendation_id
    ORDER BY count DESC
  `;
  const result = await db.query(query, [rallyId]);
  return result.rows.map((row: Record<string, any>) => ({
    recommendationId: row.recommendation_id,
    count: parseInt(row.count, 10),
  }));
};

export const getFinalVoteCount = async (
  rallyId: string
): Promise<number> => {
  const query = `SELECT COUNT(*) as count FROM final_votes WHERE rally_id = $1`;
  const result = await db.query(query, [rallyId]);
  return parseInt(result.rows[0].count, 10);
};
