import { Router } from "express";
import rallyRoutes from "./rally/rallyRoutes";
import authRoutes from "./auth/authRoutes";
import healthRouter from "./health/healthRouter";

const router = Router();

router.use("/rally", rallyRoutes);
router.use("/auth", authRoutes);
router.use("/health", healthRouter);

export default router;
