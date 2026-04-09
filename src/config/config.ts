import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    verificationServiceSid: process.env.TWILIO_VERIFICATION_SERVICE_SID || "",
    messagingPhone: process.env.TWILIO_PHONE_NUMBER || "",
  },

  jwtSecret: process.env.JWT_SECRET || "",

  phoneEncryptionKey: process.env.PHONE_ENCRYPTION_KEY || "",
  ivLength: 16,

  authRateLimiting: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  },

  rallyRateLimiting: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },

  rallyCreation: {
    maxTries: 5,
  },

  database: {
    connectionUrl: process.env.DATABASE_URL || "",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },

  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || "",
  },

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
