import { loadEnv } from "../env.js";
import { runMigrations } from "./migrate.js";
import { createPool } from "./pool.js";

async function main(): Promise<void> {
  const env = loadEnv();
  const sql = createPool(env.DATABASE_URL);
  try {
    const result = await runMigrations(sql);
    if (result.applied.length === 0) {
      console.log(`No pending migrations. ${result.skipped.length} already applied.`);
    } else {
      console.log(`Applied ${result.applied.length} migration(s):`);
      for (const filename of result.applied) {
        console.log(`  + ${filename}`);
      }
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
