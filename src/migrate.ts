import fs from "fs";
import path from "path";
import db from "./db";

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

export async function runMigrations(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await db.query(
      `SELECT 1 FROM _migrations WHERE name = $1`,
      [file]
    );
    if (rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`Running migration: ${file}`);
    try {
      await db.query(sql);
      await db.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file]);
      console.log(`  ✓ ${file}`);
    } catch (err: any) {
      if (
        err.code === "42710" || // duplicate_object (constraint already exists)
        err.code === "42701" || // duplicate_column
        err.code === "42P07"    // duplicate_table
      ) {
        console.log(`  ✓ ${file} (already applied)`);
        await db.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file]);
      } else {
        console.error(`  ✗ ${file} failed:`, err.message);
        throw err;
      }
    }
  }

  console.log("Migrations complete");
}
