import db from "../db";

export type ConstraintVote = {
  id: string;
  rallyId: string;
  participantId: string;
  budget: string;
  vibes: string[];
  distance: string;
  votedAt: Date;
};

export type AggregatedVotes = {
  budget: { low: number; mid: number; high: number };
  vibes: Record<string, number>;
  distance: { walk: number; shortDrive: number; anywhere: number };
  totalVotes: number;
};

export const createConstraintVote = async (
  rallyId: string,
  participantId: string,
  budget: string,
  vibes: string[],
  distance: string
): Promise<ConstraintVote> => {
  const query = `
    INSERT INTO constraint_votes (rally_id, participant_id, budget, vibes, distance)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (rally_id, participant_id) DO UPDATE SET
      budget = EXCLUDED.budget,
      vibes = EXCLUDED.vibes,
      distance = EXCLUDED.distance,
      voted_at = NOW()
    RETURNING id, rally_id, participant_id, budget, vibes, distance, voted_at
  `;
  const result = await db.query(query, [
    rallyId,
    participantId,
    budget,
    vibes,
    distance,
  ]);
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    participantId: row.participant_id,
    budget: row.budget,
    vibes: row.vibes,
    distance: row.distance,
    votedAt: row.voted_at,
  };
};

export const getVoteByParticipantId = async (
  rallyId: string,
  participantId: string
): Promise<ConstraintVote | null> => {
  const query = `
    SELECT id, rally_id, participant_id, budget, vibes, distance, voted_at
    FROM constraint_votes
    WHERE rally_id = $1 AND participant_id = $2
  `;
  const result = await db.query(query, [rallyId, participantId]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    participantId: row.participant_id,
    budget: row.budget,
    vibes: row.vibes,
    distance: row.distance,
    votedAt: row.voted_at,
  };
};

export const getVoteCountByRallyId = async (
  rallyId: string
): Promise<number> => {
  const query = `SELECT COUNT(*) as count FROM constraint_votes WHERE rally_id = $1`;
  const result = await db.query(query, [rallyId]);
  return parseInt(result.rows[0].count, 10);
};

export const getAggregatedVotes = async (
  rallyId: string
): Promise<AggregatedVotes> => {
  const query = `
    SELECT budget, vibes, distance
    FROM constraint_votes
    WHERE rally_id = $1
  `;
  const result = await db.query(query, [rallyId]);

  const aggregated: AggregatedVotes = {
    budget: { low: 0, mid: 0, high: 0 },
    vibes: {},
    distance: { walk: 0, shortDrive: 0, anywhere: 0 },
    totalVotes: result.rows.length,
  };

  for (const row of result.rows) {
    if (row.budget === "$") aggregated.budget.low++;
    else if (row.budget === "$$") aggregated.budget.mid++;
    else if (row.budget === "$$$") aggregated.budget.high++;

    for (const vibe of row.vibes) {
      aggregated.vibes[vibe] = (aggregated.vibes[vibe] || 0) + 1;
    }

    if (row.distance === "walk") aggregated.distance.walk++;
    else if (row.distance === "short_drive") aggregated.distance.shortDrive++;
    else if (row.distance === "anywhere") aggregated.distance.anywhere++;
  }

  return aggregated;
};
