import { Router } from "express";
import rateLimit from "express-rate-limit";
import { config } from "../../config/config";
import { sendOTP, verifyOTP } from "../../controllers/auth/authController";
import { RequestResponse } from "../../utils/apiResponse";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import {
  sendOTPBodySchema,
  verifyOTPBodySchema,
} from "../../schemas/authRequestSchemas";

const router = Router();
const apiLimiter = rateLimit({
  windowMs: config.authRateLimiting.windowMs,
  max: config.authRateLimiting.maxRequests,
  handler: (_req, res) => {
    RequestResponse(
      res,
      429,
      false,
      "Too many requests, please try again later."
    );
  },
});

router.post(
  "/otp/send",
  apiLimiter,
  validateRequestSchemaWithZod(sendOTPBodySchema, "body"),
  sendOTP
);

router.post(
  "/otp/verify",
  apiLimiter,
  validateRequestSchemaWithZod(verifyOTPBodySchema, "body"),
  verifyOTP
);

export default router;
