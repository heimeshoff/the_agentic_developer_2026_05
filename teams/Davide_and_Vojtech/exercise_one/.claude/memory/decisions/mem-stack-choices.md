---
id: mem-stack-choices
title: Decision — stack: raw SQL, Zod as single source of truth, Fastify
tags: [stack, postgres, sql, zod, fastify, vite, react, kysely, drizzle, trpc, orm, validation]
scope: decision
---
Chosen stack and the reasons, so we don't re-litigate mid-task:

- **DB access = raw SQL via the `postgres` (porsager) driver.** No ORM by default.
  All SQL stays inside `apps/api/src/db`, always parameterized (tagged-template values),
  and rows are parsed into domain types there. Reach for Kysely (typed query builder) or
  Drizzle only if hand-written SQL starts to hurt — discuss first, don't mix two of a kind.
- **Migrations = plain ordered `.sql` files** in `apps/api/migrations/`, applied by the
  runner (`t-002`). Forward-only.
- **Zod is the single source of truth for types.** Define the schema, infer the TS type —
  never hand-write a duplicate `interface`. Shared schemas live in `packages/shared`.
- **Validate at every boundary**: API request bodies/params, env vars at startup, anything
  crossing the network.
- **Transport = REST + Zod.** tRPC was considered for tighter end-to-end types; not adopted
  yet — would replace REST+Zod, not sit alongside it.
