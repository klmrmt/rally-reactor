import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getUserPreferences,
  postUserPreferences,
} from "../../controllers/userPreferences/userPreferencesController";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { config } from "../../config/config";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import {
  getUserPreferencesSchema,
  createUserPreferencesSchema,
} from "../../schemas/userPreferencesRequestSchemas";

const userPreferencesLimiter = rateLimit({
  windowMs: config.rallyRateLimiting.windowMs, // Reusing rally rate limiting config
  max: config.rallyRateLimiting.maxRequests,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const router = Router();

router.get(
  "/",
  userPreferencesLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(getUserPreferencesSchema, "query"),
  getUserPreferences
);

router.post(
  "/",
  userPreferencesLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(createUserPreferencesSchema, "body"),
  postUserPreferences
);

export default router; 