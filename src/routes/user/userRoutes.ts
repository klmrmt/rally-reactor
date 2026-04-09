import { Router } from "express";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { validateRequestSchemaWithZod } from "../../middlewares/validateRequestSchemaWithZod";
import { updateMeSchema } from "../../schemas/userSchemas";
import { getMe, updateMe, getMyRallies } from "../../controllers/user/userController";

const router = Router();

router.get("/me", authenticateToken, getMe);

router.patch(
  "/me",
  authenticateToken,
  validateRequestSchemaWithZod(updateMeSchema, "body"),
  updateMe
);

router.get("/rallies", authenticateToken, getMyRallies);

export default router;
