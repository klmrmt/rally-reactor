import { Router } from "express";
import {
  createAndSendMFACode,
  verifyMFACode,
} from "../../controllers/auth/authController";

const router = Router();
router.post("/sendmfa", createAndSendMFACode);
router.post("/login", verifyMFACode);

export default router;
