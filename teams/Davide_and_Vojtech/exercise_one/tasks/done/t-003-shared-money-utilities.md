---
id: t-003
title: Shared money utilities + Vitest
status: done
type: scaffold
created: 2026-05-26
completed: 2026-05-26
commit:
depends_on: [t-001]
files:
  - packages/shared/src/money/**
  - packages/shared/vitest.config.ts
tags: [scaffold, money, shared]
---

## Why
Money correctness is the place bugs hide. CLAUDE.md mandates integer minor units +
ISO-4217 currency and forbids ad-hoc `amount / 100` math. Every income figure, total,
and variance depends on these helpers, so they must exist and be tested before the
income schemas and API use them.

## What
In `packages/shared`, implement the money primitive and its operations:
- A `Money` value = integer minor units (`number`/`bigint`) + ISO-4217 `currency` code.
- `add`, `subtract`, `sum` (over a list), and a currency-mismatch guard that throws when
  operands disagree.
- `parse` (string/number → Money in a given currency) and `format` (Money → human string
  at the UI edge only).
- Configure Vitest for the shared package.

## Acceptance criteria
- [ ] Vitest tests cover: `add`/`subtract`/`sum`, `format` (incl. a 2-decimal currency
      and correct rounding), `parse` round-trips, and a currency-mismatch case that
      throws — all green via `pnpm test`.
- [ ] No floating-point money arithmetic anywhere in the module (amounts stay in minor
      units; formatting is the only place a decimal string is produced).
- [ ] Helpers are exported from `packages/shared` and importable by `web` and `api`.

## Notes
This is the single source of money math — t-005/t-007/t-008 must reuse it rather than
re-implement. Keep the API small and named for the domain.
