---
name: db-migration
description: Create and apply a forward-only PostgreSQL schema change for the personal-finance app as a timestamped .sql migration, and wire up the matching raw-SQL data-access module. Use this whenever a change touches the database schema: "add a budgets table", "persist savings goals", "add a currency column", "change the transactions schema", "we need a new migration", "store investments", or any request to create/alter/drop tables, columns, indexes, or constraints. Enforces the migration conventions and money/column rules in CLAUDE.md.
---

# Database migration

Schema changes are **forward-only `.sql` files** applied in order. Each change is a new
file — you never edit one that has already been applied. Read
`teams/Davide_and_Vojtech/exercise_one/CLAUDE.md` for the column rules before writing DDL.

## Step 1 — look at what's there

List `apps/api/migrations/` to see the existing files, their timestamp/naming pattern,
and the current shape of the tables you're about to touch. Match the established
convention rather than inventing a new one.

## Step 2 — create the migration file

Scaffold with `pnpm --filter api db:migrate:new <description>` if available, otherwise
create the file by hand:

```
apps/api/migrations/<UTC-timestamp>_<snake_case_description>.sql
# e.g. 20260525T1200_create_budgets.sql
```

Write the forward DDL. Column conventions (non-negotiable):

- **Money** → `BIGINT` holding integer minor units, plus a `currency CHAR(3)` (ISO-4217).
  Never `FLOAT`/`REAL`/`DOUBLE` for amounts; `NUMERIC` only if you have a specific reason.
- **Timestamps** → `TIMESTAMPTZ` (store UTC).
- **Primary keys** → match the existing tables' convention (e.g. `uuid` or identity).
- Add `NOT NULL` + sensible defaults; add foreign keys for relationships (a Budget
  references a Category and a Period, etc.).

Keep one logical change per migration. If you need a rollback path, add a paired
`*_down.sql` only if the project already does so — otherwise reverse with a new forward
migration.

## Step 3 — apply it

```bash
pnpm --filter api db:migrate
```

Confirm it applied cleanly against local Postgres (`docker compose up -d` must be running).

## Step 4 — wire up data access

- Add or update the aggregate's module in `apps/api/src/db/` with **parameterized**
  queries (use the `postgres` driver's tagged templates — never string-concatenate values).
- Map raw rows to the domain types from `packages/shared` inside this module, so callers
  work with types, not rows.

## Step 5 — reflect the shape in `packages/shared`

If the change adds or alters fields the API exposes, update the Zod schema / inferred
types in `shared` so the contract stays accurate end-to-end.

## Step 6 — verify

`pnpm --filter api db:migrate` (idempotent re-run is a no-op), then `pnpm typecheck` and
`pnpm test`. Report the migration filename, the tables/columns affected, and any new
data-access functions.

## What not to do

- **Never edit an already-applied migration.** Create a new file. Editing history breaks
  every environment that already ran the old version.
- **Never interpolate user input into SQL.** Parameterize, always — this is the SQL
  injection rule from CLAUDE.md.
- **Don't use floating-point columns for money.** Integer minor units + currency code.
- **Don't scatter SQL** across route handlers or the frontend — it lives in `src/db`.
- **Don't bundle unrelated schema changes** into one migration.
