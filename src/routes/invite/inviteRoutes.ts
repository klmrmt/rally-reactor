import { Router } from "express";
import {
  getInvite,
  postInvite,
} from "../../controllers/invite/inviteController";

const router = Router();
router.get("/", getInvite); // handles GET /api/invite?id=12312
router.post("/create", postInvite); // handles POST /api/invite/create

export default router;
