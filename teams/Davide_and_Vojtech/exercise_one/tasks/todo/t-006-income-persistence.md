---
id: t-006
title: Income persistence + migration
status: todo
type: feature
created: 2026-05-26
completed:
commit:
depends_on: [t-002, t-005]
files:
  - apps/api/migrations/**
  - apps/api/src/db/income.ts
  - apps/api/src/db/income.test.ts
tags: [income, database, api]
---

## Why
Expected and actual income must persist across restarts. The data-access layer is also
where raw DB rows get parsed into the shared domain types so the rest of the api works
with types, not rows.

## What
- A `.sql` migration creating `expected_income` and `actual_income` tables. Actual income
  optionally references the expected entry it confirms (nullable FK); both carry amount as
  minor units + currency, a date, a label, and the period they belong to.
- A data-access module (`apps/api/src/db/income.ts`) with functions to insert/list/update
  expected income, insert actual income (linked or free-form), and read a period's entries
  — all using parameterized queries, all parsing rows into the t-005 domain types.

## Acceptance criteria
- [ ] `pnpm --filter api db:migrate` applies the income migration cleanly on a fresh DB.
- [ ] A round-trip test (against the local Postgres) inserts an expected entry and an
      actual entry, reads them back, and asserts they parse into the shared domain types
      with money intact — green.
- [ ] Every query is parameterized; no string-concatenated SQL.
- [ ] Confirming an expected entry can be represented (actual row links to expected row).

## Notes
Keep all SQL inside `apps/api/src/db`. The variance/summary computation is not done here —
it belongs in the service layer (t-007). This task only stores and retrieves.
