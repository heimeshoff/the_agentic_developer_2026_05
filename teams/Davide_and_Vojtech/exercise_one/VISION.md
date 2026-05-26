# Vision — Personal finance & budgeting (Davide & Vojtech)

## Purpose
The income part lets a single user **plan and reconcile** the money coming in. Instead
of a flat ledger, the user records what they *expect* in a period and then checks
reality against it — so at a glance they know what's landed, what's still pending, and
how actual income compares to plan. It is the entry point of the money lifecycle
(Income → Budgeting → Savings) and the source of the figure budgets will later allocate
against.

## Users
A single local user (no auth, no multi-user). On a given Tuesday they: jot down this
month's expected income, mark the salary as received when it hits the account, add an
unexpected cash gift, and glance at the expected-vs-actual variance for the month.

## What success looks like
Demo of the v1 reconcile loop, end to end:
- Add this month's expected entries manually (e.g. "Salary" €3,200 ~25th, "Bonus" €500).
- Confirm an expected entry as received — adjusting the amount/date if it differed —
  which turns it into an actual.
- Free-form record an unexpected actual (e.g. "Cash gift" €100) with no prior expectation.
- See the period summary: expected total, actual total, the variance, and which
  entries are still pending — all recomputed on the server.

## Non-goals
- **Recurring projection engine** — defining a rule once and auto-projecting expected
  entries forward. Deferred to a later phase; v1 enters expected entries by hand.
- **Gross vs net / tax** — amounts are whatever net figure the user types.
- **Multi-currency per period** — single currency for the demo. Money is still stored
  as minor units + currency code, but no cross-currency totals or FX conversion.
- **Income → Budgeting handoff** — budgets actually consuming the income figure is the
  Budgeting slice; income v1 only exposes the totals.
- Bank/import integrations, auth/multi-user (already global non-goals in CLAUDE.md).

## Ubiquitous language
(Extends the CLAUDE.md glossary; reconciles "Income".)
- **Expected income** — a forecast entry for a period: free-text label, amount (minor
  units + currency), expected date, status (pending | received).
- **Actual income** — money that actually arrived: either *confirmed* from an expected
  entry (linked to it) or *recorded free-form* (unexpected income, no prior expectation).
- **Confirm / receive** — the gesture that turns an expected entry into an actual; the
  amount and date may be adjusted at confirmation time.
- **Variance** — for a period, the difference between expected total and actual total
  (plus the count/value still pending). Always recomputed server-side.
- **Period** — calendar month (per CLAUDE.md). Expected/actual entries roll up to it.
- **Income** (refined) — the existing glossary term now splits into *expected* vs *actual*.

## Decisions
- 2026-05-26 — Income module's job is **plan + reconcile**: forecast expected income,
  record actuals, surface the variance. Not a flat money-in ledger.
- 2026-05-26 — v1 ships manual expected entries + both reconcile gestures
  (confirm-expected and free-form actual) + per-period variance. **No recurring
  projection engine in v1.**
- 2026-05-26 — Income entries carry a **free-text label**, not a structured source list.
- 2026-05-26 — v1 is single-currency per period; no gross/net/tax; income→budgeting
  handoff deferred to the Budgeting slice.

## Open questions
- Recurring rules / projection: cadence model, how far forward to project, editing a
  rule vs. already-projected entries. (Deferred phase.)
- Promote free-text label → structured income sources once reporting needs it.
- Multi-currency and FX handling.
- The contract by which income totals feed the Budgeting slice.
- Expected-date precision (exact day vs. "within period") and whether overdue/pending
  entries need surfacing/alerts.
