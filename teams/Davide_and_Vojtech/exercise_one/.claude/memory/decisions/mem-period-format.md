---
id: mem-period-format
title: Decision — budget periods are stored as YYYY-MM
tags: [period, month, budget, date, format, yyyy-mm, reporting, storage, column, schema, key]
scope: decision
---
Budget periods persist as a `YYYY-MM` string (e.g. `2026-06`) representing a calendar month.

Why: budgets and reports roll up per calendar month, and a fixed-width zero-padded string
key makes range queries (`period >= '2026-01'`), ordering, and `GROUP BY period` trivial —
no date arithmetic, no timezone ambiguity for the period key itself. Lexical order equals
chronological order.

Notes:
- This is the canonical key for the `period` column / field everywhere (schema, API, UI).
- Distinct from the dates-as-UTC-ISO-8601 rule: individual transaction/income *timestamps*
  stay full ISO-8601; only the budgeting **Period** rolls up to `YYYY-MM`.
- Periods are reasoned about in the user's timezone but the `YYYY-MM` key is stored canonically.
