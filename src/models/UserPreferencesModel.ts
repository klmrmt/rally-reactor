import db from "../db";

export type UserPreferences = {
  id: string;
  user_id: string;
  rally_id: string;
  cost_level: string;
  vibe: string;
  location_radius: number;
  submitted_at: Date;
};

/**
 * Creates user preferences in the database.
 * Returns the created preferences object.
 */
export const createUserPreferences = async (
  userId: string,
  rallyId: string,
  costLevel: string,
  vibe: string,
  locationRadius: number
): Promise<UserPreferences> => {
  const query = `
    INSERT INTO user_preferences (
      user_id,
      rally_id,
      cost_level,
      vibe,
      location_radius,
      submitted_at
    ) VALUES (
      $1, $2, $3, $4, $5, NOW()
    )
    RETURNING id, user_id, rally_id, cost_level, vibe, location_radius, submitted_at
  `;

  const values = [userId, rallyId, costLevel, vibe, locationRadius];

  const result = await db.query(query, values);
  const row = result.rows[0];

  return {
    id: row.id,
    user_id: row.user_id,
    rally_id: row.rally_id,
    cost_level: row.cost_level,
    vibe: row.vibe,
    location_radius: row.location_radius,
    submitted_at: row.submitted_at,
  };
};

/**
 * Retrieves user preferences by user ID and rally ID.
 * Returns the preferences object if found, or null if not found.
 */
export const getUserPreferencesByUserIdAndRallyId = async (
  userId: string,
  rallyId: string
): Promise<UserPreferences | null> => {
  const query = `
    SELECT id, user_id, rally_id, cost_level, vibe, location_radius, submitted_at
    FROM user_preferences
    WHERE user_id = $1 AND rally_id = $2
  `;
  const values = [userId, rallyId];

  const result = await db.query(query, values);
  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    rally_id: row.rally_id,
    cost_level: row.cost_level,
    vibe: row.vibe,
    location_radius: row.location_radius,
    submitted_at: row.submitted_at,
  };
};

/**
 * Updates existing user preferences.
 * Returns the updated preferences object.
 */
export const updateUserPreferences = async (
  userId: string,
  rallyId: string,
  costLevel: string,
  vibe: string,
  locationRadius: number
): Promise<UserPreferences> => {
  const query = `
    UPDATE user_preferences
    SET cost_level = $3, vibe = $4, location_radius = $5, submitted_at = NOW()
    WHERE user_id = $1 AND rally_id = $2
    RETURNING id, user_id, rally_id, cost_level, vibe, location_radius, submitted_at
  `;

  const values = [userId, rallyId, costLevel, vibe, locationRadius];

  const result = await db.query(query, values);
  const row = result.rows[0];

  return {
    id: row.id,
    user_id: row.user_id,
    rally_id: row.rally_id,
    cost_level: row.cost_level,
    vibe: row.vibe,
    location_radius: row.location_radius,
    submitted_at: row.submitted_at,
  };
}; 