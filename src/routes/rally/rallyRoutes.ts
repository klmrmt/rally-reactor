import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getRally, postRally } from "../../controllers/rally/rallyController";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { config } from "../../config/config";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import {
  getRallySchema,
  createRallySchema,
} from "../../schemas/rallyRequestSchemas";

const rallyLimiter = rateLimit({
  windowMs: config.rallyRateLimiting.windowMs,
  max: config.rallyRateLimiting.maxRequests,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const router = Router();

router.get(
  "/",
  rallyLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(getRallySchema, "query"),
  getRally
);

router.post(
  "/create",
  rallyLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(createRallySchema, "body"),
  postRally
);

export default router;
