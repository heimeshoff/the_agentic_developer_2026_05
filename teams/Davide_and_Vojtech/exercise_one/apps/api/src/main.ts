import { buildApp } from "./app.js";
import { createPool } from "./db/pool.js";
import { loadEnv } from "./env.js";

let env: ReturnType<typeof loadEnv>;
try {
  env = loadEnv();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const sql = createPool(env.DATABASE_URL);
const app = buildApp();

app
  .listen({ port: env.API_PORT, host: env.API_HOST })
  .then(async () => {
    await sql`SELECT 1`;
    app.log.info("database connection ok");
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
