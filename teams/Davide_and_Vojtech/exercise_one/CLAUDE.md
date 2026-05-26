# CLAUDE.md — Exercise One (Davide & Vojtech)

Guidance for Claude Code when working in this folder. These instructions are scoped
to `teams/Davide_and_Vojtech/exercise_one/`. The repo-root `CLAUDE.md` (workshop rules)
still applies and is not repeated here except where it matters day-to-day.

## What we're building

A **personal finance & budgeting** web app. The user tracks money through its lifecycle:

> **Income → Budgeting → Savings & Investments → (Debt-free)**

Core capabilities we care about:

- **Income** — record money coming in (salary, one-off, recurring).
- **Budgeting** — allocate income across categories per period (e.g. Rent 30%, Food 15%, Savings 20%, Discretionary 25%); track planned vs. actual spend.
- **Savings** — savings goals with a target and progress (e.g. Emergency Fund €5,000, 85%).
- **Investments** — holdings and their current value.
- **Dashboard** — at-a-glance budget breakdown, YTD spending, goal progress, net position.

The brief is deliberately loose: favour breadth and exploration over production polish.
This is a workshop about *how we work with the agent*, not about shipping.

## Status

> **The project is not scaffolded yet.** The stack and layout below are the agreed
> conventions to build toward. As you scaffold, wire up the npm scripts named in
> "Commands" so they become real. Keep this file in sync as decisions change.

## Tech stack

| Concern         | Choice                                                        |
| --------------- | ------------------------------------------------------------- |
| Language        | TypeScript (`strict: true`), Node 22 LTS                      |
| Repo            | pnpm workspaces (monorepo)                                    |
| Frontend        | React + Vite                                                  |
| UI/charts       | Tailwind CSS + Recharts                                       |
| Server state    | TanStack Query                                                |
| Backend         | Fastify                                                       |
| Validation      | Zod (shared schemas, single source of truth for types)        |
| Database        | PostgreSQL                                                     |
| DB access       | Raw SQL via the `postgres` (porsager) driver                  |
| Migrations      | Plain `.sql` files in `apps/api/migrations/`, applied by a runner |
| Tests           | Vitest                                                         |
| Lint/format     | Biome                                                          |
| Local infra     | Docker Compose (Postgres)                                      |

Reasonable swaps if a need emerges: add a typed query builder (Kysely) or a
lightweight ORM (Drizzle) if hand-written SQL starts to hurt; tRPC instead of
REST+Zod for tighter end-to-end types. Discuss before switching — don't mix two of
the same kind of tool.

## Project layout

```
exercise_one/
  package.json            # workspace root, top-level scripts
  pnpm-workspace.yaml
  tsconfig.base.json
  biome.json
  docker-compose.yml      # local Postgres
  .env.example            # documents required env vars
  apps/
    web/                  # React + Vite SPA
    api/                  # Fastify API server
      migrations/         # ordered .sql migration files
      src/db/             # connection pool + per-aggregate data-access modules
  packages/
    shared/               # Zod schemas, inferred types, money utilities
```

- **`packages/shared` is the contract.** Domain types, Zod schemas, and money helpers
  live here and are imported by both `web` and `api`. Don't redefine a type that
  already exists in `shared`.
- Keep domain/business logic in `api` services, not in route handlers and not in the UI.

## Commands

Run from `exercise_one/` (the workspace root). Wire these up as you scaffold.

```bash
pnpm install                      # install all workspaces
docker compose up -d              # start local Postgres
pnpm dev                          # run web + api together
pnpm --filter web dev             # frontend only
pnpm --filter api dev             # backend only
pnpm typecheck                    # tsc across workspaces
pnpm test                         # Vitest
pnpm lint                         # Biome check
pnpm format                       # Biome write

# Database (run inside apps/api)
pnpm --filter api db:migrate            # apply pending .sql migrations
pnpm --filter api db:migrate:new <name> # scaffold a new timestamped migration file
pnpm --filter api db:reset              # drop, recreate, re-migrate (local only)
```

## Domain glossary

Use these names consistently in code, schema, and API:

- **Account** — where money lives (checking, savings, brokerage).
- **Transaction** — a single money movement: amount, date, category, account, direction (in/out).
- **Income** — incoming money; may be one-off or recurring.
- **Category** — classification for budgeting/spend (Rent, Food, Utilities, Discretionary, …).
- **Budget** — planned allocation per category for a **Period**, as a percentage or absolute amount.
- **Period** — the timeframe budgets and reports roll up to (default: calendar month).
- **SavingsGoal** — a target amount with current progress (e.g. Emergency Fund).
- **Holding / Investment** — an invested asset with cost basis and current value.

## Domain rules (non-negotiable)

- **Money is integer minor units (cents) + an ISO-4217 currency code. Never floats.**
  All amounts are `number` (or `bigint` if large) representing the smallest unit, paired
  with a `currency`. Formatting to a human-readable string happens only at the UI edge.
  Put parsing/formatting/arithmetic helpers in `packages/shared` and use them everywhere —
  never do ad-hoc `amount / 100` math.
- **Validate at every boundary** with Zod: API request bodies/params, env vars at startup,
  and anything crossing the network. Infer TypeScript types from the Zod schema; don't
  hand-write a duplicate `interface`.
- **Dates** are stored as UTC ISO-8601. Budget periods are reasoned about in the user's
  timezone but persisted canonically.
- **Don't trust the client.** Recompute budget/spend totals on the server.
- **Always use parameterized queries.** Never build SQL by concatenating user input —
  pass values as query parameters (the `postgres` driver does this for tagged-template
  values). Keep SQL inside `apps/api/src/db`, and parse/shape DB rows into domain types
  there so the rest of the code works with types, not raw rows.

## Coding conventions

- `strict` TypeScript. Avoid `any`; prefer `unknown` + a Zod parse at the boundary.
- Functions and modules small and named for the domain (`createBudget`, not `handlePost`).
- No comments that narrate *what* the code does — only *why*, when non-obvious.
- Tests colocated with the code (`*.test.ts`), run with Vitest. Cover money math and
  budget calculations especially — those are where correctness bugs hide.
- Don't add abstractions, config flags, or error handling for cases that can't happen.
  Three similar lines beat a premature abstraction.

## Git workflow (workshop)

- We work on the **`Davide_and_Vojtech`** branch. All code lives under
  `teams/Davide_and_Vojtech/exercise_one/`. Never write team code under `instructions/`.
- Merge back to `main` with **`--no-ff`** so our branch stays a visible unit in history.
- Commit only when asked.

## Out of scope (for now)

- Auth / multi-user — assume a single local user unless we decide otherwise.
- Real bank integrations, payments, deployment, CI.
- Production hardening. Optimize for fast iteration and exploration.
