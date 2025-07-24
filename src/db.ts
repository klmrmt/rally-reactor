import { Pool } from "pg";
import { config } from "./config/config";
const pool = new Pool({
  connectionString: config.database.connectionUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("✅ Using SSL config:", {
  connectionString: config.database.connectionUrl,
  ssl: { rejectUnauthorized: false },
});

export default pool;

// Attach pool to app in server.ts or app.ts for req.app.get('db') usage
