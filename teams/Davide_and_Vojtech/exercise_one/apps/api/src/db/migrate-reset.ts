import { loadEnv } from "../env.js";
import { runMigrations } from "./migrate.js";
import { createPool } from "./pool.js";

async function main(): Promise<void> {
  const env = loadEnv();
  const sql = createPool(env.DATABASE_URL);
  try {
    await sql.unsafe("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    console.log("Dropped and recreated public schema.");
    const result = await runMigrations(sql);
    console.log(`Re-applied ${result.applied.length} migration(s).`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
