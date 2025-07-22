import { config } from "../config/config";
import db from "../db";

export type Rally = {
  id: string;
  groupName: string;
  scheduledTime: Date;
  callToAction: string;
  createdAt: Date;
  inviteExpiresAt: Date;
  inviteHexId: string;
};

const generateInviteId = (): string => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const MAX_TRIES = config.inviteCreation.maxTries || 5;

export const createRally = async (
  userId: string,
  groupName: string,
  callToRally: string,
  hangoutDateTime: Date
): Promise<Rally> => {
  let lastError;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const inviteHexId = generateInviteId();

    const query = `
      INSERT INTO rallies (
        group_leader_id,
        group_name,
        scheduled_time,
        call_to_action,
        created_at,
        invite_expires_at,
        invite_hex_id
      ) VALUES (
        $1, $2, $3, $4, NOW(), $5, $6
      )
      RETURNING id, group_name, scheduled_time, call_to_action, created_at, invite_expires_at, invite_hex_id
    `;

    const values = [
      userId,
      groupName,
      hangoutDateTime,
      callToRally,
      hangoutDateTime,
      inviteHexId,
    ];

    try {
      const result = await db.query(query, values);
      return {
        id: result.rows[0].id,
        groupName: result.rows[0].group_name,
        scheduledTime: result.rows[0].scheduled_time,
        callToAction: result.rows[0].call_to_action,
        createdAt: result.rows[0].created_at,
        inviteExpiresAt: result.rows[0].invite_expires_at,
        inviteHexId: result.rows[0].invite_hex_id,
      };
    } catch (err: any) {
      // Check for unique constraint violation
      if (err.code === "23505" && err.detail?.includes("invite_hex_id")) {
        lastError = err;
        continue; // Try again with a new code
      }
      throw err; // Some other DB error
    }
  }
  throw new Error(
    "Failed to generate a unique invite code after multiple attempts."
  );
};

export const getRallyByInviteHexId = async (
  inviteHexId: string
): Promise<Rally | null> => {
  const query = `
        SELECT id, group_name, scheduled_time, call_to_action, created_at, invite_expires_at, invite_hex_id
        FROM rallies
        WHERE invite_hex_id = $1
    `;
  const values = [inviteHexId];

  const result = await db.query(query, values);
  if (result.rows.length === 0) {
    return null; // No rally found with this invite ID
  }

  const row = result.rows[0];
  return {
    id: row.id,
    groupName: row.group_name,
    scheduledTime: row.scheduled_time,
    callToAction: row.call_to_action,
    createdAt: row.created_at,
    inviteExpiresAt: row.invite_expires_at,
    inviteHexId: row.invite_hex_id,
  };
};
