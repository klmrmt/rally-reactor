import express from 'express';
import pool from '../../db';

const app = express();
app.use(express.json());

/**
/**
 * @route POST /createGroup
 * @description Create a new group (rally) in the database.
 *
 * Example request body:
 * {
 *   "id": 1,
 *   "name": "My Rally Group",
 *   "groupLeaderId": 42,
 *   "scheduledTime": "2024-07-01T18:00:00-07:00",
 *   "callToAction": "Join us for the rally!",
 *   "expiryTime": "2024-07-02T01:00:00Z"
 * }
 *
 * Note: No input validation or authentication is performed.
 *       SQL query may need to match the actual 'rallies' table schema.
 */
app.post('/createGroup', async (req, res) => {
    const { id, name, groupLeaderId, scheduledTime, callToAction, expiryTime } = req.body as {
      id: number;
      name: string;
      groupLeaderId: number;
      scheduledTime: string;
      callToAction: string;
      expiryTime: string;
    };

    const scheduledTimeGMT = new Date(scheduledTime).toISOString();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(expiryTime).toISOString();

    try {
      const query = `INSERT INTO rallies (id, group_leader_id, group_name, scheduled_time, call_to_action, created_at, expires_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`;
      const result = await pool.query(query, [id, groupLeaderId,name, scheduledTimeGMT, callToAction, createdAt, expiresAt]);

      res.status(200).json({ message: 'Group created properly', groupId: result.rows[0].id, created_at: result.rows[0].created_at });
    } catch (err) {
      console.error('Error inserting group:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
})





