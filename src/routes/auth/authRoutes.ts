import { Router } from "express";
import rateLimit from "express-rate-limit";
import { config } from "../../config/config";
import { sendOTP, verifyOTP } from "../../controllers/auth/authController";
import { RequestResponse } from "../../utils/apiResponse";

// Initialize router
const router = Router();

// Apply rate limiting to authentication routes
// This should help us mitigate brute-force attacks
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

// Define routes
// Both routes are POST requests to force parameters to be sent in the body
// rather than the URL, which is more secure for sensitive data
router.post("/otp/send", apiLimiter, sendOTP);

// Route to verify OTP and issue JWT token upon successful verification
router.post("/otp/verify", apiLimiter, verifyOTP);

export default router;
