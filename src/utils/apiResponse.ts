import { Response } from "express";

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export type AuthenticationResponse = {
  token: string;
  user: {
    userId: string;
    displayName: string | null;
  };
};

// Helper function to send standardized API responses
export const RequestResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T
) => {
  const response: ApiResponse<T> = { success, message, ...(data && { data }) };
  return res.status(statusCode).json(response);
};
