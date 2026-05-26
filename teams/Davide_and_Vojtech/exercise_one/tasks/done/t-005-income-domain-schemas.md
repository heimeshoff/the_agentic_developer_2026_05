---
id: t-005
title: Income domain schemas (shared)
status: done
type: feature
created: 2026-05-26
completed: 2026-05-26
commit:
depends_on: [t-003]
files:
  - packages/shared/src/income/**
tags: [income, shared, schema]
---

## Why
`packages/shared` is the contract: the API and UI must agree on the shape of expected
income, actual income, periods, and the variance summary. Defining these as Zod schemas
(with inferred types) once prevents drift and gives every boundary a validator.

## What
In `packages/shared/src/income`, define Zod schemas and infer TypeScript types for:
- **ExpectedIncome** — free-text label, amount (Money from t-003), expected date, status
  (`pending | received`).
- **ActualIncome** — label, amount (Money), date, and an optional link to the
  ExpectedIncome it confirms (absent = unexpected/free-form income).
- **Period** — a calendar month identifier (e.g. year + month) that entries roll up to.
- **PeriodSummary / Variance** — expected total, actual total, the variance, and the
  pending count/value for a period.
- Request payload schemas for the operations t-007 will expose (create/edit expected,
  confirm-expected, record actual).

## Acceptance criteria
- [ ] Vitest tests parse representative valid payloads and reject invalid ones (bad
      status, missing currency, negative/garbage amount, malformed date) — green.
- [ ] All TS types are **inferred** from the Zod schemas; no hand-written duplicate
      `interface` for the same shape (CLAUDE.md rule).
- [ ] Amounts reuse the shared Money type/helpers from t-003 — no local money shape.
- [ ] Schemas are exported and importable by `api` and `web`.

## Notes
No recurring-rule schema in v1 (deferred — see VISION.md non-goals). Dates are UTC
ISO-8601 per CLAUDE.md. Keep the summary/variance shape here so the server and UI compute
and display the same fields.
