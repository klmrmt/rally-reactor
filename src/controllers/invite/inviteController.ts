import { Request, Response } from "express";
import crypto from 'crypto';

export const getInvite = (req: Request, res: Response) => {
  const inviteId = req.query.inviteId;
  // Fetch Data Simulation
  res.json({
    message: `Invite details for ID ${inviteId}`,
    inviteDetails: {
      id: inviteId,
      name: "Sample Invite",
      status: "Pending",
    },
  });
};

export const postInvite = (req: Request, res: Response): void => {
  res.json({
    message: `Invite created for ${req.body.groupName}`,
    inviteId: Math.floor(Math.random() * 1000), // Simulating an invite ID
  });
};

/**
 * @route POST /invite/user
 * @description Invite a user by phone number, hash the phone, store in invitee table, and update user's past_rallies.
 * @param {string} phoneNumber - The phone number to invite.
 * @param {number} rallyId - The rally ID for the invite.
 * @param {number} invitedByUserId - The user ID of the inviter.
 * @returns {200} JSON with invitee info on success.
 * @returns {404} If user not found for updating past_rallies.
 * @returns {500} On error.
 */
export const postInviteUser = async (req: Request, res: Response) => {
  const { phoneNumber, rallyId, invitedByUserId } = req.body;
  if (!phoneNumber || !rallyId || !invitedByUserId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  // will need to change based off of what hash we do and will have to compare with what's in database
  const hashedPhone = crypto.createHash('sha256').update(phoneNumber).digest('hex');
  const invited_at = new Date().toISOString();
  const invite_status = 'pending';
  const invite_token = crypto.randomBytes(16).toString('hex');
  try {
    // Insert into invitee table
    const inviteeResult = await req.app.get('db').query(
      `INSERT INTO invitee (hashed_phone, invite_status, invited_at, rally_id, invited_by_user_id, invite_token)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [hashedPhone, invite_status, invited_at, rallyId, invitedByUserId, invite_token]
    );
    // Update user's past_rallies if user exists
    const userResult = await req.app.get('db').query(
      `UPDATE users SET past_rallies = array_append(past_rallies, $1)
       WHERE hashed_phone = $2 RETURNING *`,
      [rallyId, hashedPhone]
    );
    if (userResult.rowCount === 0) {
      res.status(404).json({ error: 'User not found for updating past_rallies' });
      return;
    }
    res.status(200).json({ invitee: inviteeResult.rows[0], user: userResult.rows[0] });
  } catch (err) {
    console.error('Error inviting user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
