import { Router } from "express";
import inviteRoutes from "./invite/inviteRoutes";
import authRoutes from "./auth/authRoutes";
import healthRouter from "./health/healthRouter";

const router = Router();

router.use("/invite", inviteRoutes);
router.use("/auth", authRoutes);
router.use("/health", healthRouter);

export default router;
