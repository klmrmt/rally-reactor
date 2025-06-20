import { Router } from "express";
import inviteRoutes from "./invite/inviteRoutes";
import authRoutes from "./auth/authRoutes";

const router = Router();

router.use("/invite", inviteRoutes);
router.use("/auth", authRoutes);

export default router;
