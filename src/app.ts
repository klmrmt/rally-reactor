import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import healthRouter from "./routes/health/healthRouter";

const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
// Use Helmet to secure Express apps by setting various HTTP headers
app.use(helmet());
// Enable CORS for all routes
app.use(cors());
// Use Morgan for logging HTTP requests
app.use(morgan("dev"));

app.use("/rally-api", routes);
app.use(errorHandler);

export default app;
