import db from "../db";

export type Feedback = {
  id: string;
  rallyId: string;
  participantId: string;
  recommendationId: string;
  liked: boolean;
  tags: string[];
  createdAt: Date;
};

export const createFeedback = async (
  rallyId: string,
  participantId: string,
  recommendationId: string,
  liked: boolean,
  tags: string[]
): Promise<Feedback> => {
  const query = `
    INSERT INTO feedback (rally_id, participant_id, recommendation_id, liked, tags)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (rally_id, participant_id) DO UPDATE SET
      liked = EXCLUDED.liked,
      tags = EXCLUDED.tags,
      created_at = NOW()
    RETURNING id, rally_id, participant_id, recommendation_id, liked, tags, created_at
  `;
  const result = await db.query(query, [
    rallyId,
    participantId,
    recommendationId,
    liked,
    tags,
  ]);
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    participantId: row.participant_id,
    recommendationId: row.recommendation_id,
    liked: row.liked,
    tags: row.tags,
    createdAt: row.created_at,
  };
};

export const getFeedbackByRallyId = async (
  rallyId: string
): Promise<Feedback[]> => {
  const query = `
    SELECT id, rally_id, participant_id, recommendation_id, liked, tags, created_at
    FROM feedback
    WHERE rally_id = $1
    ORDER BY created_at ASC
  `;
  const result = await db.query(query, [rallyId]);
  return result.rows.map((row) => ({
    id: row.id,
    rallyId: row.rally_id,
    participantId: row.participant_id,
    recommendationId: row.recommendation_id,
    liked: row.liked,
    tags: row.tags,
    createdAt: row.created_at,
  }));
};
