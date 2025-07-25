import db from "../db";

// Creates a user in the database
// User ID is auto-generated by the database
// The Hashed phone number is used to check for existing users
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

// Retrieves a user by their user ID
export const getUserById = async (userId: string) => {
  const query = `
    SELECT user_id FROM public.users
    WHERE user_id = $1;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

// Retrieves a user ID based on the hashed phone number
export const getUserIdByPhoneHash = async (phoneHash: string) => {
  const query = `
    SELECT user_id FROM public.users
    WHERE hashed_phone_number = $1;
  `;
  const result = await db.query(query, [phoneHash]);
  return result.rows[0];
};
