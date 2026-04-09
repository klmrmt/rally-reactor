import db from "../db";

export type User = {
  userId: string;
  hashedPhoneNumber: string;
  encryptedPhoneNumber: string;
  displayName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
};

export type RallySummary = {
  id: string;
  hexId: string;
  groupName: string;
  scheduledTime: Date;
  callToAction: string;
  status: string;
  location: string | null;
  participantCount: number;
  role: "creator" | "participant";
};

export const createUser = async (
  phoneHash: string,
  encryptedPhone: string,
  profilePictureUrl?: string,
  bio?: string,
  displayName?: string
) => {
  const query = `
    INSERT INTO public.users (hashed_phone_number, encrypted_phone_number, profile_image_url, bio, display_name)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const result = await db.query(query, [
    phoneHash,
    encryptedPhone,
    profilePictureUrl || null,
    bio || null,
    displayName || null,
  ]);
  return result.rows[0];
};

export const getUserById = async (userId: string) => {
  const query = `
    SELECT user_id FROM public.users
    WHERE user_id = $1;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

export const getUserIdByPhoneHash = async (phoneHash: string) => {
  const query = `
    SELECT user_id FROM public.users
    WHERE hashed_phone_number = $1;
  `;
  const result = await db.query(query, [phoneHash]);
  return result.rows[0];
};

export const getUserFullById = async (userId: string): Promise<User | null> => {
  const query = `
    SELECT user_id, hashed_phone_number, encrypted_phone_number,
           display_name, profile_image_url, bio
    FROM public.users
    WHERE user_id = $1
  `;
  const result = await db.query(query, [userId]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    userId: row.user_id,
    hashedPhoneNumber: row.hashed_phone_number,
    encryptedPhoneNumber: row.encrypted_phone_number,
    displayName: row.display_name,
    profileImageUrl: row.profile_image_url,
    bio: row.bio,
  };
};

export const updateUserDisplayName = async (
  userId: string,
  displayName: string
): Promise<User | null> => {
  const query = `
    UPDATE public.users SET display_name = $2
    WHERE user_id = $1
    RETURNING user_id, hashed_phone_number, encrypted_phone_number,
              display_name, profile_image_url, bio
  `;
  const result = await db.query(query, [userId, displayName]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    userId: row.user_id,
    hashedPhoneNumber: row.hashed_phone_number,
    encryptedPhoneNumber: row.encrypted_phone_number,
    displayName: row.display_name,
    profileImageUrl: row.profile_image_url,
    bio: row.bio,
  };
};

export const getRalliesForUser = async (userId: string): Promise<RallySummary[]> => {
  const query = `
    SELECT DISTINCT ON (r.id)
      r.id,
      r.hex_id,
      r.group_name,
      r.scheduled_time,
      r.call_to_action,
      r.status,
      r.location,
      CASE WHEN r.group_leader_id = $1 THEN 'creator' ELSE 'participant' END AS role,
      (SELECT COUNT(*) FROM participants p2 WHERE p2.rally_id = r.id)::int AS participant_count
    FROM rallies r
    LEFT JOIN participants p ON p.rally_id = r.id AND p.user_id = $1
    WHERE r.group_leader_id = $1 OR p.user_id = $1
    ORDER BY r.id, r.scheduled_time DESC
  `;
  const result = await db.query(query, [userId]);
  return result.rows.map((row) => ({
    id: row.id,
    hexId: row.hex_id,
    groupName: row.group_name,
    scheduledTime: row.scheduled_time,
    callToAction: row.call_to_action,
    status: row.status,
    location: row.location,
    participantCount: row.participant_count,
    role: row.role,
  }));
};
