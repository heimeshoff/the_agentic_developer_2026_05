---
id: mem-budget-period
title: Domain — budget, period, and the money lifecycle
tags: [budget, period, category, allocation, savings, investment, dashboard, planned, actual, spend, timezone]
scope: domain
---
The app tracks money through its lifecycle: **Income → Budgeting → Savings & Investments → (Debt-free).**

Core terms (keep names consistent in code, schema, and API):

- **Budget** — a planned allocation per **Category** for a **Period**, as a percentage or
  absolute amount (e.g. Rent 30%, Food 15%, Savings 20%, Discretionary 25%).
- **Period** — the timeframe budgets and reports roll up to. Default: calendar month.
- **Category** — classification for budgeting/spend (Rent, Food, Utilities, Discretionary…).
- **SavingsGoal** — a target amount with current progress (e.g. Emergency Fund €5,000, 85%).
- **Holding / Investment** — an invested asset with cost basis and current value.

Rules:
- **Don't trust the client.** Always recompute budget/spend/variance totals on the server.
- **Dates** persist as UTC ISO-8601. Periods are *reasoned about* in the user's timezone but
  *stored* canonically.
- Track planned vs. actual spend per category; the dashboard rolls these up (budget
  breakdown, YTD spending, goal progress, net position).
