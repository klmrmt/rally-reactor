import { Router } from "express";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import { manualRecommendationSchema } from "../../schemas/adminSchemas";
import { overrideRecommendations } from "../../controllers/admin/adminController";

const router = Router();

router.post(
  "/:hexId/recommendations",
  authenticateToken,
  validateRequestSchemaWithZod(manualRecommendationSchema, "body"),
  overrideRecommendations
);

export default router;
