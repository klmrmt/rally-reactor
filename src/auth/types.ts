import { Request } from "express";
export interface JwtPayload {
  user_id: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
