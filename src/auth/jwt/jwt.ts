import { config } from "../../config/config";
import jwt from "jsonwebtoken";

// Function to generate a JWT token for a given userId
export const generateToken = (userID: string) => {
  const token = jwt.sign({ userID }, config.jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

// Function to verify a given JWT token
// Function to verify a given JWT token and return the decoded payload or null
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    console.error("[JWT VERIFY ERROR]", {
      token,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};
