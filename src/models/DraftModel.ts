import db from "../db";

export type RallyDraft = {
  id: string;
  userId: string;
  step: number;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_DRAFTS_PER_USER = 10;

function mapDraftRow(row: any): RallyDraft {
  return {
    id: row.id,
    userId: row.user_id,
    step: row.step,
    data: row.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getDraftsByUser = async (userId: string): Promise<RallyDraft[]> => {
  const result = await db.query(
    `SELECT id, user_id, step, data, created_at, updated_at
     FROM rally_drafts
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows.map(mapDraftRow);
};

export const getDraftById = async (
  id: string,
  userId: string
): Promise<RallyDraft | null> => {
  const result = await db.query(
    `SELECT id, user_id, step, data, created_at, updated_at
     FROM rally_drafts
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (result.rows.length === 0) return null;
  return mapDraftRow(result.rows[0]);
};

export const createDraft = async (
  userId: string,
  step: number,
  data: Record<string, unknown>
): Promise<RallyDraft> => {
  const countResult = await db.query(
    `SELECT COUNT(*) FROM rally_drafts WHERE user_id = $1`,
    [userId]
  );
  if (parseInt(countResult.rows[0].count) >= MAX_DRAFTS_PER_USER) {
    await db.query(
      `DELETE FROM rally_drafts
       WHERE id = (
         SELECT id FROM rally_drafts WHERE user_id = $1 ORDER BY updated_at ASC LIMIT 1
       )`,
      [userId]
    );
  }

  const result = await db.query(
    `INSERT INTO rally_drafts (user_id, step, data)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, step, data, created_at, updated_at`,
    [userId, step, JSON.stringify(data)]
  );
  return mapDraftRow(result.rows[0]);
};

export const updateDraft = async (
  id: string,
  userId: string,
  step: number,
  data: Record<string, unknown>
): Promise<RallyDraft | null> => {
  const result = await db.query(
    `UPDATE rally_drafts
     SET step = $3, data = $4, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, step, data, created_at, updated_at`,
    [id, userId, step, JSON.stringify(data)]
  );
  if (result.rows.length === 0) return null;
  return mapDraftRow(result.rows[0]);
};

export const deleteDraft = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const result = await db.query(
    `DELETE FROM rally_drafts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
};
