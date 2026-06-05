---
id: mem-income-slice
title: Feature — income vertical slice (t-005 → t-008)
tags: [income, slice, feature, t-005, t-006, t-007, t-008, persistence, migration, api, ui, period]
scope: feature
---
The income capability is being built as a thin vertical slice, database → screen:

- **t-005 (done)** — shared Zod income schemas (one-off + recurring), reusing the Money primitive.
- **t-006 (todo)** — persistence + migration: `expected_income` and `actual_income` tables
  (actual optionally FK-links the expected entry it confirms); data-access module in
  `apps/api/src/db/income.ts`, parameterized queries, rows parsed into the t-005 domain types.
  Variance/summary is NOT done here — that's the service layer.
- **t-007 (todo)** — income API: Fastify routes; variance/summary (expected vs actual) computed
  server-side. Depends on t-006.
- **t-008 (todo)** — income-per-period UI: React screen, verified rendering in Playwright with
  no console errors. Depends on t-007.

Verification levels per task: logic → a Vitest test; API → service boots + endpoint responds;
UI → screen renders in a browser via Playwright with no console errors.
