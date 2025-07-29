import { config } from "../../config/config";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

// Function to generate a JWT token for a given userId
export const generateToken = (userID: string): string => {
  const token = jwt.sign({ user_id: userID }, config.jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

// Function to verify a given JWT token and return the decoded payload or null
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    console.error("[JWT VERIFY ERROR]", {
      token,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};
