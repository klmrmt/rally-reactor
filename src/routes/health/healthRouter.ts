import { Router } from "express";
import { dbHealthCheck } from "../../controllers/health/dbHealthCheck";

const healthRouter = Router();

healthRouter.get("/db", dbHealthCheck);

export default healthRouter;
