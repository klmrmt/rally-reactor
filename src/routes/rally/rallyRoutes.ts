import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getRally, postRally, patchRally } from "../../controllers/rally/rallyController";
import {
  listDrafts,
  getDraft,
  postDraft,
  putDraft,
  removeDraft,
} from "../../controllers/rally/draftController";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { config } from "../../config/config";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import {
  getRallySchema,
  createRallySchema,
  updateRallySchema,
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

router.patch(
  "/:hexId",
  authenticateToken,
  validateRequestSchemaWithZod(updateRallySchema, "body"),
  patchRally
);

router.get("/drafts", authenticateToken, listDrafts);
router.get("/drafts/:id", authenticateToken, getDraft);
router.post("/drafts", authenticateToken, postDraft);
router.put("/drafts/:id", authenticateToken, putDraft);
router.delete("/drafts/:id", authenticateToken, removeDraft);

export default router;
