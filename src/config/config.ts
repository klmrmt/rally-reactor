import dotenv from "dotenv";
dotenv.config();

export const config = {
  // Server port
  port: process.env.PORT || 3000,
  // Twilio configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    verificationServiceSid: process.env.TWILIO_VERIFICATION_SERVICE_SID || "",
  },
  // JWT secret for signing tokens
  jwtSecret: process.env.JWT_SECRET || "",

  // Encryption Key for phone number security
  // Must be a 32-byte hex string for AES-256
  phoneEncryptionKey: process.env.PHONE_ENCRYPTION_KEY || "",
  ivLength: 16,

  // Rate limiting configuration for authentication routes
  authRateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // limit each IP to 10 requests per windowMs
  },

  // Rate limiting configuration for room  routes
  inviteRateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // limit each IP to 5 requests per windowMs
  },

  database: {
    connectionUrl: process.env.DATABASE_URL || "",
  },
};
