---
id: t-007
title: Income API (Fastify routes + service)
status: todo
type: feature
created: 2026-05-26
completed:
commit:
depends_on: [t-006]
files:
  - apps/api/src/routes/income.ts
  - apps/api/src/services/income.ts
  - apps/api/src/services/income.test.ts
  - apps/api/src/app.ts
tags: [income, api]
---

## Why
The UI needs endpoints to drive the reconcile loop, and the variance/totals must be
computed on the server — never trusted from the client (CLAUDE.md rule). This is the
behaviour layer between persistence and the screen.

## What
Fastify routes + a service for the v1 income loop:
- Create / edit / delete **expected income** for a period.
- **Confirm-expected**: mark an expected entry received, creating the linked actual; the
  amount and date may be adjusted at confirm time.
- **Record free-form actual**: income with no prior expectation.
- **Period summary**: returns expected total, actual total, variance, and pending — all
  computed server-side from stored rows using the shared money helpers.
- Validate every request body/params with the t-005 Zod schemas at the boundary.

## Acceptance criteria
- [ ] Unit test on the summary/variance computation (money math): given a mix of
      pending/received expected entries and free-form actuals, expected total, actual
      total, variance, and pending are correct — green.
- [ ] The api boots and the flow works against the running service: create two expected
      entries → confirm one (adjusting amount) → record one free-form actual → GET the
      period summary returns the correct totals and variance.
- [ ] Invalid payloads are rejected with a 4xx by Zod validation, not a 500.
- [ ] Totals are recomputed server-side; the client cannot submit a precomputed total.

## Notes
Keep domain logic in `services/income.ts`, not in route handlers. Reuse the data-access
module from t-006 and money helpers from t-003. REST endpoints; shapes come from
`packages/shared`.
