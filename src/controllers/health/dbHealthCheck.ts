// controllers/health/healthController.ts
import { Request, Response } from "express";
import { RequestResponse } from "../../utils/apiResponse";
import pool from "../../db";

export const dbHealthCheck = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    `);
    
    // Get table structure if it exists
    let tableStructure = null;
    if (tableCheck.rows.length > 0) {
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      tableStructure = structureResult.rows;
    }
    
    RequestResponse(res, 200, true, "Database connection successful", {
      time: result.rows[0].now,
      usersTableExists: tableCheck.rows.length > 0,
      tableInfo: tableCheck.rows[0] || null,
      tableStructure: tableStructure
    });
  } catch (error) {
    console.error("DB Connection Error:", error);
    RequestResponse(res, 500, false, "Database connection failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};