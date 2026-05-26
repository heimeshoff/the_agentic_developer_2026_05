---
id: t-002
title: Local Postgres + migration runner
status: todo
type: scaffold
created: 2026-05-26
completed:
commit:
depends_on: [t-001]
files:
  - docker-compose.yml
  - apps/api/migrations/**
  - apps/api/src/db/**
  - apps/api/src/env.ts
tags: [scaffold, database]
---

## Why
The income slice persists expected and actual income. Before any table or query exists,
the api needs a database connection, validated config, and a way to apply ordered SQL
migrations.

## What
- `docker-compose.yml` running a local PostgreSQL.
- Zod-validated environment loading at api startup (`apps/api/src/env.ts`) — fail fast
  on missing/invalid `DATABASE_URL` etc.
- Connection pool using the `postgres` (porsager) driver in `apps/api/src/db`.
- A migration runner that applies ordered `.sql` files from `apps/api/migrations/`,
  wired to the `db:migrate`, `db:migrate:new <name>`, and `db:reset` scripts named in
  CLAUDE.md. Include one initial migration (can be a no-op / `migrations` bookkeeping
  table) to prove the runner works.

## Acceptance criteria
- [ ] `docker compose up -d` starts Postgres and it accepts connections.
- [ ] `pnpm --filter api db:migrate` applies the initial migration cleanly and is
      idempotent on a second run (no error, nothing re-applied).
- [ ] `pnpm --filter api db:migrate:new <name>` scaffolds a new timestamped `.sql` file.
- [ ] The api boots with a valid env and connects; it exits with a clear error when a
      required env var is missing (env validated by Zod).

## Notes
Keep SQL inside `apps/api/src/db`. Use parameterized queries everywhere (CLAUDE.md rule).
Income tables themselves are added in t-006 — this task only sets up the machinery and
one bootstrap migration.
