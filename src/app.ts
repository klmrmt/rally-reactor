import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import healthRouter from "./routes/health/healthRouter";
import { config } from "./config/config";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? config.clientUrl : true,
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/rally-api", routes);
app.use(errorHandler);

export default app;
