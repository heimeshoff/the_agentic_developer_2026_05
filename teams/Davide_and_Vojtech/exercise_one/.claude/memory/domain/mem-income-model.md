---
id: mem-income-model
title: Domain — income model (one-off vs recurring, expected vs actual)
tags: [income, recurring, one-off, salary, expected, actual, period, money]
scope: domain
---
Income is money coming in. Two orthogonal distinctions:

- **One-off vs recurring** — a single payment vs a repeating schedule (e.g. monthly salary).
  Both validated by the shared Zod income schemas (`t-005`), reusing the Money primitive.
- **Expected vs actual** — `expected_income` is what we plan/forecast for a period;
  `actual_income` is what landed. An actual entry may optionally reference (confirm) the
  expected entry it fulfils via a nullable FK; it can also be free-form (unplanned income).

Each entry carries: amount as minor units + currency, a date (UTC ISO-8601), a label, and
the period it belongs to. Variance/summary (expected vs actual) is **not** computed in the
data layer — it belongs to the api service layer. Persistence only stores and retrieves.
