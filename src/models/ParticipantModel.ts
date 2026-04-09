import db from "../db";

export type Participant = {
  id: string;
  rallyId: string;
  userId: string | null;
  displayName: string;
  joinedAt: Date;
};

export const createParticipant = async (
  rallyId: string,
  displayName: string,
  userId?: string
): Promise<Participant> => {
  const query = `
    INSERT INTO participants (rally_id, user_id, display_name)
    VALUES ($1, $2, $3)
    RETURNING id, rally_id, user_id, display_name, joined_at
  `;
  const result = await db.query(query, [rallyId, userId || null, displayName]);
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    userId: row.user_id,
    displayName: row.display_name,
    joinedAt: row.joined_at,
  };
};

export const getParticipantsByRallyId = async (
  rallyId: string
): Promise<Participant[]> => {
  const query = `
    SELECT id, rally_id, user_id, display_name, joined_at
    FROM participants
    WHERE rally_id = $1
    ORDER BY joined_at ASC
  `;
  const result = await db.query(query, [rallyId]);
  return result.rows.map((row) => ({
    id: row.id,
    rallyId: row.rally_id,
    userId: row.user_id,
    displayName: row.display_name,
    joinedAt: row.joined_at,
  }));
};

export const getParticipantById = async (
  participantId: string
): Promise<Participant | null> => {
  const query = `
    SELECT id, rally_id, user_id, display_name, joined_at
    FROM participants
    WHERE id = $1
  `;
  const result = await db.query(query, [participantId]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    userId: row.user_id,
    displayName: row.display_name,
    joinedAt: row.joined_at,
  };
};

export const getParticipantByUserAndRally = async (
  rallyId: string,
  userId: string
): Promise<Participant | null> => {
  const query = `
    SELECT id, rally_id, user_id, display_name, joined_at
    FROM participants
    WHERE rally_id = $1 AND user_id = $2
  `;
  const result = await db.query(query, [rallyId, userId]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    rallyId: row.rally_id,
    userId: row.user_id,
    displayName: row.display_name,
    joinedAt: row.joined_at,
  };
};

export const getParticipantCount = async (
  rallyId: string
): Promise<number> => {
  const query = `SELECT COUNT(*) as count FROM participants WHERE rally_id = $1`;
  const result = await db.query(query, [rallyId]);
  return parseInt(result.rows[0].count, 10);
};

export const getParticipantPhonesForRally = async (
  rallyId: string
): Promise<Array<{ participantId: string; encryptedPhoneNumber: string }>> => {
  const query = `
    SELECT p.id AS participant_id, u.encrypted_phone_number
    FROM participants p
    JOIN users u ON u.user_id = p.user_id
    WHERE p.rally_id = $1
      AND p.user_id IS NOT NULL
  `;
  const result = await db.query(query, [rallyId]);
  return result.rows.map((row) => ({
    participantId: row.participant_id,
    encryptedPhoneNumber: row.encrypted_phone_number,
  }));
};
