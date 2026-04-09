import { Router } from "express";
import rallyRoutes from "./rally/rallyRoutes";
import authRoutes from "./auth/authRoutes";
import healthRouter from "./health/healthRouter";
import sessionRoutes from "./session/sessionRoutes";
import adminRoutes from "./admin/adminRoutes";
import previewRoutes from "./preview/previewRoutes";
import userRoutes from "./user/userRoutes";
import testRoutes from "./test/testRoutes";

const router = Router();

router.use("/rally", rallyRoutes);
router.use("/auth", authRoutes);
router.use("/health", healthRouter);
router.use("/session", sessionRoutes);
router.use("/admin", adminRoutes);
router.use("/preview", previewRoutes);
router.use("/user", userRoutes);

if (process.env.NODE_ENV === "test") {
  router.use("/test", testRoutes);
}

export default router;
