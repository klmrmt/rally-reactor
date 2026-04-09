import { config } from "../config/config";
import db from "../db";

export type RallyStatus =
  | "voting"
  | "recommending"
  | "picking"
  | "decided"
  | "completed";

export type Rally = {
  id: string;
  groupLeaderId: string;
  groupName: string;
  scheduledTime: Date;
  callToAction: string;
  createdAt: Date;
  expiresAt: Date;
  hexId: string;
  status: RallyStatus;
  votingClosesAt: Date | null;
  location: string | null;
  radiusMiles: number | null;
  latitude: number | null;
  longitude: number | null;
  chosenRecommendationId: string | null;
};

// Function to generate a unique hex code for rally IDs
// This generates a 6-character alphanumeric string
// This is used to create unique rally identifiers for URLs
const generateHexId = (): string => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const MAX_TRIES = config.rallyCreation.maxTries || 5;

/**
 * Creates a new rally in the database.
 * Retries up to MAX_TRIES times if a unique hex code conflict occurs.
 * Returns the created rally object.
 */
export const createRally = async (
  userId: string,
  groupName: string,
  callToRally: string,
  hangoutDateTime: Date,
  location?: string,
  radiusMiles?: number,
  latitude?: number,
  longitude?: number,
  votingDurationMinutes: number = 10
): Promise<Rally> => {
  let lastError;
  const votingClosesAt = new Date(
    Date.now() + votingDurationMinutes * 60 * 1000
  );

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const rallyHexId = generateHexId();

    const query = `
      INSERT INTO rallies (
        group_leader_id,
        group_name,
        scheduled_time,
        call_to_action,
        created_at,
        expires_at,
        hex_id,
        status,
        voting_closes_at,
        location,
        radius_miles,
        latitude,
        longitude
      ) VALUES (
        $1, $2, $3, $4, NOW(), $5, $6, 'voting', $7, $8, $9, $10, $11
      )
      RETURNING id, group_leader_id, group_name, scheduled_time, call_to_action,
                created_at, expires_at, hex_id, status, voting_closes_at, location,
                radius_miles, latitude, longitude, chosen_recommendation_id
    `;

    const values = [
      userId,
      groupName,
      hangoutDateTime,
      callToRally,
      hangoutDateTime,
      rallyHexId,
      votingClosesAt,
      location || null,
      radiusMiles ?? null,
      latitude ?? null,
      longitude ?? null,
    ];

    try {
      const result = await db.query(query, values);
      return mapRallyRow(result.rows[0]);
    } catch (err: any) {
      if (err.code === "23505" && err.detail?.includes("hex_id")) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw new Error(
    "Failed to generate a unique hex code after multiple attempts."
  );
};

/**
 * Retrieves a rally by its unique hex ID.
 * Returns the rally object if found, or null if not found.
 */
export const getRallyByRallyHexId = async (
  rallyHexId: string
): Promise<Rally | null> => {
  const query = `
    SELECT id, group_leader_id, group_name, scheduled_time, call_to_action,
           created_at, expires_at, hex_id, status, voting_closes_at, location,
           radius_miles, latitude, longitude, chosen_recommendation_id
    FROM rallies
    WHERE hex_id = $1
  `;
  const result = await db.query(query, [rallyHexId]);
  if (result.rows.length === 0) return null;
  return mapRallyRow(result.rows[0]);
};

export const getRallyById = async (
  rallyId: string
): Promise<Rally | null> => {
  const query = `
    SELECT id, group_leader_id, group_name, scheduled_time, call_to_action,
           created_at, expires_at, hex_id, status, voting_closes_at, location,
           radius_miles, latitude, longitude, chosen_recommendation_id
    FROM rallies
    WHERE id = $1
  `;
  const result = await db.query(query, [rallyId]);
  if (result.rows.length === 0) return null;
  return mapRallyRow(result.rows[0]);
};

export const updateRallyStatus = async (
  rallyId: string,
  status: RallyStatus
): Promise<Rally | null> => {
  const query = `
    UPDATE rallies SET status = $2
    WHERE id = $1
    RETURNING id, group_leader_id, group_name, scheduled_time, call_to_action,
              created_at, expires_at, hex_id, status, voting_closes_at, location,
              radius_miles, latitude, longitude, chosen_recommendation_id
  `;
  const result = await db.query(query, [rallyId, status]);
  if (result.rows.length === 0) return null;
  return mapRallyRow(result.rows[0]);
};

function mapRallyRow(row: any): Rally {
  return {
    id: row.id,
    groupLeaderId: row.group_leader_id,
    groupName: row.group_name,
    scheduledTime: row.scheduled_time,
    callToAction: row.call_to_action,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    hexId: row.hex_id,
    status: row.status,
    votingClosesAt: row.voting_closes_at,
    location: row.location,
    radiusMiles: row.radius_miles ? parseFloat(row.radius_miles) : null,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    chosenRecommendationId: row.chosen_recommendation_id || null,
  };
}

export const getRalliesNeedingFeedbackReminder = async (): Promise<Rally[]> => {
  const query = `
    SELECT id, group_leader_id, group_name, scheduled_time, call_to_action,
           created_at, expires_at, hex_id, status, voting_closes_at, location,
           radius_miles, latitude, longitude, chosen_recommendation_id
    FROM rallies
    WHERE status = 'decided'
      AND scheduled_time < NOW() - INTERVAL '2 hours'
      AND scheduled_time > NOW() - INTERVAL '26 hours'
  `;
  const result = await db.query(query);
  return result.rows.map(mapRallyRow);
};

export const updateRally = async (
  rallyId: string,
  leaderId: string,
  fields: {
    groupName?: string;
    callToAction?: string;
    scheduledTime?: Date;
    location?: string | null;
    radiusMiles?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  }
): Promise<Rally | null> => {
  const rally = await getRallyById(rallyId);
  if (!rally || rally.groupLeaderId !== leaderId) return null;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (fields.groupName !== undefined) {
    setClauses.push(`group_name = $${idx++}`);
    values.push(fields.groupName);
  }
  if (fields.callToAction !== undefined) {
    setClauses.push(`call_to_action = $${idx++}`);
    values.push(fields.callToAction);
  }
  if (fields.scheduledTime !== undefined) {
    setClauses.push(`scheduled_time = $${idx++}`);
    values.push(fields.scheduledTime);
    setClauses.push(`expires_at = $${idx++}`);
    values.push(fields.scheduledTime);
  }
  if (fields.location !== undefined) {
    setClauses.push(`location = $${idx++}`);
    values.push(fields.location);
  }
  if (fields.radiusMiles !== undefined) {
    setClauses.push(`radius_miles = $${idx++}`);
    values.push(fields.radiusMiles);
  }
  if (fields.latitude !== undefined) {
    setClauses.push(`latitude = $${idx++}`);
    values.push(fields.latitude);
  }
  if (fields.longitude !== undefined) {
    setClauses.push(`longitude = $${idx++}`);
    values.push(fields.longitude);
  }

  if (setClauses.length === 0) return rally;

  values.push(rallyId);
  const query = `
    UPDATE rallies SET ${setClauses.join(", ")}
    WHERE id = $${idx}
    RETURNING id, group_leader_id, group_name, scheduled_time, call_to_action,
              created_at, expires_at, hex_id, status, voting_closes_at, location,
              radius_miles, latitude, longitude, chosen_recommendation_id
  `;
  const result = await db.query(query, values);
  return result.rows.length > 0 ? mapRallyRow(result.rows[0]) : null;
};

export const setChosenRecommendation = async (
  rallyId: string,
  recommendationId: string
): Promise<Rally | null> => {
  const query = `
    UPDATE rallies
    SET chosen_recommendation_id = $2, status = 'decided'
    WHERE id = $1
    RETURNING id, group_leader_id, group_name, scheduled_time, call_to_action,
              created_at, expires_at, hex_id, status, voting_closes_at, location,
              radius_miles, latitude, longitude, chosen_recommendation_id
  `;
  const result = await db.query(query, [rallyId, recommendationId]);
  return result.rows.length > 0 ? mapRallyRow(result.rows[0]) : null;
};
