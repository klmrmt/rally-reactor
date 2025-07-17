import { Request } from "express";
export interface JwtPayload {
  userID: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
