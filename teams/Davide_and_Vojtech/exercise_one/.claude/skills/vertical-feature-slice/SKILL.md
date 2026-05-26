---
name: vertical-feature-slice
description: Build a new capability in the personal-finance app as a complete, thin vertical slice across all layers — shared Zod schema, Fastify API route, raw-SQL data access, and the React UI — with tests. Use this whenever the user asks to add or extend a feature: "add income tracking", "build the budgets page", "let users set a savings goal", "show YTD spending", "add a transactions endpoint", "wire up the dashboard widget", or any request that needs to travel from the database to the screen. Keeps every feature consistent with the architecture and money rules in CLAUDE.md.
---

# Vertical feature slice

Add the feature as one thin slice that goes all the way through the stack, not as a
pile of layers built in isolation. Smallest change that delivers visible behavior.
Read `teams/Davide_and_Vojtech/exercise_one/CLAUDE.md` first — the stack, layout,
and non-negotiable rules (money as minor units, Zod at boundaries, parameterized SQL)
govern everything below.

## Step 1 — frame the slice

State, in one or two sentences, the observable behavior you're adding (e.g. "user can
create a monthly budget for a category and see planned vs. actual"). If the request is
really several features, pick the thinnest one that's useful on its own and do that;
flag the rest.

Use the domain glossary names from CLAUDE.md (Account, Transaction, Income, Category,
Budget, Period, SavingsGoal, Holding) — don't invent synonyms.

## Step 2 — define the contract in `packages/shared`

This is the single source of truth both `web` and `api` import.

- Write/extend the **Zod schema** for the entity and for the request/response shapes.
- Derive TypeScript types with `z.infer` — never hand-write a duplicate `interface`.
- Money fields are **integer minor units + an ISO-4217 currency code**. Reuse the
  shared money helpers; don't add ad-hoc `amount / 100`.

## Step 3 — persistence (`apps/api/src/db`)

- If the slice needs a schema change (new table/column), **stop and run the
  `db-migration` skill** to add the migration first, then come back.
- Add or extend the data-access module for this aggregate: **parameterized** SQL only,
  and map raw rows into the domain types from `shared` right here. SQL lives in `db/`,
  nowhere else.

## Step 4 — API route (`apps/api`)

- Add the Fastify route. Validate input with the **shared Zod schema** at the boundary.
- Keep the handler thin: parse → call the data-access function → return a typed result.
  Put any real logic (budget math, aggregation) in a service function, not the handler.
- **Recompute totals on the server.** Never trust client-sent sums.

## Step 5 — frontend (`apps/web`)

- Add a TanStack Query hook that calls the endpoint and is typed via the shared schema.
- Build the React component/widget; style with Tailwind. For charts (donut/bar like the
  dashboard mockup) use Recharts.
- **Format money only here, at the UI edge**, via the shared formatter. The rest of the
  app passes minor units around untouched.

## Step 6 — tests (Vitest)

- Cover the money math and budget/spend calculations first — that's where correctness
  bugs hide. One behavior per test, descriptive names, deterministic.
- Add at least one test at the data-access or route level for the new path.

## Step 7 — verify

Run from the workspace root: `pnpm typecheck`, `pnpm test`, `pnpm lint`. Fix what breaks.
Report the files touched per layer and the command to see it running.

## What not to do

- **Don't build one layer in isolation** and call it done — a slice that doesn't reach
  the screen isn't a slice.
- **Don't duplicate types.** If `shared` already defines it, import it.
- **Don't do money math in floats** or format money anywhere but the UI edge.
- **Don't put SQL in route handlers or components** — it belongs in `apps/api/src/db`.
- **Don't add abstractions for hypothetical future features.** Build the slice asked for.
