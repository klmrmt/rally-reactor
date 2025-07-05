// controllers/health/healthController.ts
import { Request, Response } from "express";
import { RequestResponse } from "../../utils/apiResponse";
import pool from "../../db";

export const dbHealthCheck = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    RequestResponse(res, 200, true, "Database connection successful", {
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("DB Connection Error:", error);
    RequestResponse(res, 500, false, "Database connection failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};