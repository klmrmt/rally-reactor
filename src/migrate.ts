import fs from "fs";
import path from "path";
import db from "./db";

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

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
      const IDEMPOTENT_CODES = ["42710", "42701", "42P07"];
      if (IDEMPOTENT_CODES.includes(err.code)) {
        console.log(`  ~ ${file} hit ${err.code}, running statements individually...`);
        const stmts = splitStatements(sql);
        for (const stmt of stmts) {
          try {
            await db.query(stmt);
          } catch (stmtErr: any) {
            if (IDEMPOTENT_CODES.includes(stmtErr.code)) {
              console.log(`    (skipped: ${stmtErr.message})`);
            } else {
              console.error(`    statement failed: ${stmtErr.message}`);
              throw stmtErr;
            }
          }
        }
        await db.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file]);
        console.log(`  ✓ ${file} (applied with skips)`);
      } else {
        console.error(`  ✗ ${file} failed:`, err.message);
        throw err;
      }
    }
  }

  console.log("Migrations complete");
}
