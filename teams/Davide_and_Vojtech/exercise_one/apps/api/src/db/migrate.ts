import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Sql } from "postgres";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "migrations");

const SCHEMA_MIGRATIONS_TABLE = "schema_migrations";

async function ensureMigrationsTable(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

async function appliedFilenames(sql: Sql): Promise<Set<string>> {
  const rows = await sql<{ filename: string }[]>`
    SELECT filename FROM schema_migrations
  `;
  return new Set(rows.map((row) => row.filename));
}

async function migrationFiles(): Promise<string[]> {
  const entries = await readdir(migrationsDir);
  return entries.filter((name) => name.endsWith(".sql")).sort();
}

export type MigrationResult = {
  applied: string[];
  skipped: string[];
};

export async function runMigrations(sql: Sql): Promise<MigrationResult> {
  await ensureMigrationsTable(sql);
  const already = await appliedFilenames(sql);
  const files = await migrationFiles();

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const filename of files) {
    if (already.has(filename)) {
      skipped.push(filename);
      continue;
    }
    const ddl = await readFile(join(migrationsDir, filename), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(ddl);
      await tx`
        INSERT INTO schema_migrations (filename) VALUES (${filename})
      `;
    });
    applied.push(filename);
  }

  return { applied, skipped };
}

export { SCHEMA_MIGRATIONS_TABLE };
