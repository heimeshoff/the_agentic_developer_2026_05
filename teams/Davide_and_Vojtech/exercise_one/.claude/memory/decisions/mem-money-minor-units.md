---
id: mem-money-minor-units
title: Decision — money is integer minor units + currency, never floats
tags: [money, currency, cents, decimal, rounding, float, allocation, amount]
scope: decision
---
All money is stored as an integer count of the smallest unit (cents) paired with an
ISO-4217 `currency` code. Never floats — float math silently loses cents and breaks
budget reconciliation.

- Amounts are `number` (or `bigint` if large) of minor units, always alongside a `currency`.
- Parsing, formatting, arithmetic, and percentage allocation live in `packages/shared`
  (the Money primitive, `t-003`). Use those helpers everywhere — never ad-hoc `amount / 100`.
- Formatting to a human string happens only at the UI edge.

Why: correctness bugs in finance hide in money math and rounding. One canonical
representation + one set of tested helpers keeps every layer consistent and auditable.
