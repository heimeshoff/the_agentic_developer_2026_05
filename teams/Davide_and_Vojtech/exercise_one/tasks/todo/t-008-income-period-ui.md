---
id: t-008
title: Income period UI (web)
status: todo
type: feature
created: 2026-05-26
completed:
commit:
depends_on: [t-004, t-005, t-007]
files:
  - apps/web/src/**
  - apps/web/e2e/income.spec.ts
tags: [income, web, ui]
---

## Why
This is the slice the demo shows: the user plans the month's income and reconciles it
against reality, seeing the variance at a glance. It ties the schema, API, and money
helpers together into the screen described in VISION.md.

## What
A React screen for a selected period that:
- Lists **expected income** entries with their status (pending | received).
- Lets the user add/edit an expected entry.
- Offers the **confirm** gesture on a pending entry (with optional amount/date
  adjustment) → turns it into an actual.
- Lets the user **free-form add an actual** (unexpected income).
- Shows the **period summary**: expected total, actual total, variance, pending — a
  small Recharts expected-vs-actual bar is welcome but optional.
- Uses TanStack Query for server state and formats money via the shared helpers at the
  UI edge only.

## Acceptance criteria
- [ ] Playwright e2e (`apps/web/e2e/income.spec.ts`): add an expected entry → confirm it
      → free-form add an unexpected actual → assert the variance/totals update on screen
      → assert no console errors. Passes via `pnpm --filter web test:e2e`.
- [ ] All money rendered through the shared `format` helper (no ad-hoc `/100`).
- [ ] The screen reads totals from the API's period summary (t-007); it does not compute
      the variance itself.

## Notes
Depends on the e2e harness (t-004), shared schemas (t-005), and the API (t-007). Keep
business logic out of the UI — the screen displays and dispatches, the server computes.
Single currency for v1 (VISION.md non-goal).
