import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrationFilename, toSnakeCase } from "./migration-naming.js";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "migrations");

async function main(): Promise<void> {
  const rawName = process.argv.slice(2).join(" ");
  if (!toSnakeCase(rawName)) {
    console.error('Usage: db:migrate:new "<description>"');
    process.exit(1);
  }
  const filename = migrationFilename(rawName, new Date());
  const filepath = join(migrationsDir, filename);
  const template = `-- Migration: ${toSnakeCase(rawName)}
-- Forward-only. Never edit after it has been applied; add a new migration instead.

`;
  await writeFile(filepath, template, { flag: "wx" });
  console.log(`Created apps/api/migrations/${filename}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
