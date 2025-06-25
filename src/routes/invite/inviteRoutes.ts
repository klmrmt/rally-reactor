import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getInvite,
  postInvite,
} from "../../controllers/invite/inviteController";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { config } from "../../config/config";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import {
  getInviteQuerySchema,
  postInviteBodySchema,
} from "../../schemas/inviteRequestSchemas";

const inviteLimiter = rateLimit({
  windowMs: config.inviteRateLimiting.windowMs,
  max: config.inviteRateLimiting.maxRequests,
  message: {
    success: false,
    message: "Too many invite requests, please try again later.",
  },
});

const router = Router();

router.get(
  "/",
  inviteLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(getInviteQuerySchema, "query"),
  getInvite
);

router.post(
  "/create",
  inviteLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(postInviteBodySchema, "body"),
  postInvite
);

export default router;
