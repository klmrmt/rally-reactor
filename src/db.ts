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
