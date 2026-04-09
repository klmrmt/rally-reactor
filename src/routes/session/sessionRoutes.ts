import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateParticipant } from "../../middlewares/authenticateParticipant";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import {
  joinRallySchema,
  constraintVoteSchema,
  finalVoteSchema,
  feedbackSchema,
  selectWinnerSchema,
} from "../../schemas/sessionSchemas";
import {
  joinRally,
  getRallyInfo,
  submitConstraintVote,
  getVoteStatus,
  closeVoting,
  triggerRecommendations,
  getRecommendations,
  submitFinalVote,
  getRallyResult,
  submitFeedback,
  selectWinner,
} from "../../controllers/session/sessionController";

const isTest = process.env.NODE_ENV === "test";

const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 30,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const infoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 120,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const router = Router();

router.get("/:hexId", infoLimiter, getRallyInfo);

router.post(
  "/:hexId/join",
  sessionLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(joinRallySchema, "body"),
  joinRally
);

router.post(
  "/:hexId/vote",
  sessionLimiter,
  authenticateParticipant,
  validateRequestSchemaWithZod(constraintVoteSchema, "body"),
  submitConstraintVote
);

router.get(
  "/:hexId/votes",
  sessionLimiter,
  authenticateParticipant,
  getVoteStatus
);

router.post(
  "/:hexId/close-voting",
  sessionLimiter,
  authenticateToken,
  closeVoting
);

router.post(
  "/:hexId/generate-recommendations",
  sessionLimiter,
  authenticateToken,
  triggerRecommendations
);

router.get(
  "/:hexId/recommendations",
  sessionLimiter,
  authenticateParticipant,
  getRecommendations
);

router.post(
  "/:hexId/select",
  sessionLimiter,
  authenticateToken,
  validateRequestSchemaWithZod(selectWinnerSchema, "body"),
  selectWinner
);

router.post(
  "/:hexId/pick",
  sessionLimiter,
  authenticateParticipant,
  validateRequestSchemaWithZod(finalVoteSchema, "body"),
  submitFinalVote
);

router.get(
  "/:hexId/result",
  sessionLimiter,
  authenticateParticipant,
  getRallyResult
);

router.post(
  "/:hexId/feedback",
  sessionLimiter,
  authenticateParticipant,
  validateRequestSchemaWithZod(feedbackSchema, "body"),
  submitFeedback
);

export default router;
