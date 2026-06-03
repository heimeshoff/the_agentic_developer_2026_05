# Requirements — Personal Finance App (Exercise One)

**Team:** michele-luca · **Branch:** `team-michele-luca`
**Status:** v1 requirements, captured via domain interview (2026-05-25)
**Author:** drafted with the `budgeting-finance-expert` agent

This document is the agreed scope and domain model for v1. It is the contract the
implementation should satisfy. Decisions marked **[decided]** came from the
interview; **[default]** are sensible defaults chosen by the domain expert and
open to change; **[deferred]** is explicitly out of scope for v1.

---

## 1. Goal & primary job

A **local-first personal spending tracker** whose primary job is to **track where
money goes** and check it against a **monthly budget**. The ledger of transactions
is the source of truth; every other number (balance, spent, remaining) is
*derived* from it, never stored and hand-edited. **[decided]**

### In scope for v1 **[decided]**
- **Income** — money coming in (salary, transfers in, irregular income).
- **Budgeting** — planned monthly allocation per expense category, with
  spent / remaining / over-budget tracking.

### Out of scope for v1 **[deferred]**
- **Savings goals** — named targets with progress tracking.
- **Investments** — holdings, cost basis, valuations, gains/losses.
- Multiple accounts and transfers between them.
- Multi-currency and exchange rates.
- CSV / bank import; any backend or sync.

These are deferred, not rejected — the model below is shaped so they can be added
without a rewrite (see §7).

---

## 2. Key decisions (the parameters that shape the model)

| Area | Decision | Notes |
|------|----------|-------|
| Account model | **Single account** **[decided]** | One pot of money. No `accountId` on transactions, no transfers in v1. |
| Currency | **Single currency: EUR (€)** **[decided]** | Every amount is EUR. No FX. Currency code stored but constant. |
| Budget period | **Monthly (calendar month)** **[decided]** | Period key = `YYYY-MM`, inclusive of 1st through last day. |
| Categories | **Preset list, editable** **[decided]** | Ship sensible defaults; user can add / rename / archive. Not free-text per transaction. |
| Recurring entries | **Yes** **[decided]** | Auto-repeating income/expenses (salary, rent, subscriptions). Monthly cadence for v1. |
| Data entry | **Manual entry only** **[decided]** | Quick-add form. No import in v1. |
| Budget rollover | **Roll over leftovers** **[decided]** | Unspent (or overspent) amount carries into next month. See §5. |
| Over-budget behavior | **Warn, but allow** **[decided]** | Over-budget category shows red / "over by €X"; the transaction is still recorded. No blocking. |
| Sign convention | **`type: 'income' \| 'expense'`** **[default]** | Amounts stored as positive minor units; the `type` carries direction. Chosen over signed amounts so categories and reporting stay unambiguous. |

---

## 3. Domain correctness rules (non-negotiable)

These come from the finance-domain rules and apply everywhere:

1. **Money is integer minor units (cents).** All amounts stored as
   `amountMinor: number` (integer). Never store or sum currency as floating point.
   Convert to/from decimal **only** at the UI edge (input parsing and display
   formatting). €12.34 → `1234`.
2. **Amounts are positive; direction lives in `type`.** An expense of €50 is
   `{ amountMinor: 5000, type: 'expense' }`, not `-5000`. Income is `type: 'income'`.
3. **Transactions are the source of truth.** Account balance, budget "spent", and
   every chart total are **computed** from transactions on read. Nothing derived is
   persisted as an editable field. (Derived values may be memoised in-memory with a
   clear recompute-on-change story, never written back to storage.)
4. **Dates are timezone-stable.** Ledger entries store a **date-only** value as
   `YYYY-MM-DD` (local calendar date). No timestamps, no UTC conversion — a
   transaction must not jump days across timezones. Month membership is decided by
   string prefix (`date.startsWith(month)`).
5. **Categories are an owned list, not strings.** A transaction references a
   `categoryId`. Renaming a category must not fragment history.
6. **Budgets apply to expense categories only.** Income is not "budgeted" in v1;
   it is tracked and shown against spending.
7. **Edge cases must be handled explicitly:** €0 budget (everything is over),
   refunds / negative-effect entries (model a refund as an `income`-type entry in an
   expense category, or document the chosen approach), deleting a category that has
   transactions (block or archive — see §4.5), and a recurring rule whose start date
   is in the past (back-fill, see §4.4).

---

## 4. Functional requirements

### 4.1 Transactions (the ledger)
- **Add** a transaction: amount (decimal input, parsed to minor units), date
  (defaults to today), `type` (income/expense), category, optional note.
- **Edit** and **delete** any transaction.
- **List** all transactions: sortable by date (newest first default), filterable by
  month, type, and category.
- Validation: amount > 0; date valid; category required and its `kind` must match
  the entry `type` (an `expense` entry needs an expense category).

### 4.2 Income
- Income entries are transactions with `type: 'income'`.
- Income categories exist in the preset list (e.g. Salary, Other income).
- Income is **excluded** from budget "spent"; it feeds the dashboard's
  income-vs-spending and the net balance.

### 4.3 Budgeting
- For each **expense category** the user can set a **planned monthly amount**
  (`plannedMinor`) per month (`YYYY-MM`).
- Per category, per month, the app computes and shows:
  - **spent** = sum of `expense` transactions in that category that month;
  - **available** = `plannedMinor` + **carry-in** from the previous month (§5);
  - **remaining** = available − spent;
  - **% used** and an **over-budget** flag when spent > available.
- A category with no budget set for the month shows spend but no remaining target.

### 4.4 Recurring entries
- A **recurring rule**: `{ type, amountMinor, categoryId, note, dayOfMonth,
  startDate, endDate? }`, monthly cadence for v1.
- The app **materialises** real transactions from each rule for every due date from
  `startDate` up to today (back-fill on first run, and forward as months pass).
- Generated transactions carry `sourceRuleId` so they are identifiable; the user can
  edit or delete an individual occurrence without deleting the rule.
- Editing a rule affects **future** occurrences only; already-materialised
  transactions are left as-is (document this clearly in the UI).

### 4.5 Categories
- Ship a **default preset** (expense: Groceries, Rent/Housing, Transport, Eating
  out, Utilities, Health, Leisure, Other; income: Salary, Other income). **[default]**
- User can **add**, **rename**, and **archive** categories. Archiving (not hard
  delete) preserves historical transactions; archived categories don't appear in the
  add-transaction picker but still render in past reports.
- Each category has a `kind: 'income' | 'expense'`.

---

## 5. Budget rollover math (because rollover was chosen)

Rollover makes "available" recursive across months. Definition for a category `c`:

```
carryIn(c, firstMonth) = 0
available(c, m)        = planned(c, m) + carryIn(c, m)
spent(c, m)            = sum of expense transactions in c during month m
remaining(c, m)        = available(c, m) - spent(c, m)
carryIn(c, m+1)        = remaining(c, m)        // may be negative if overspent
```

- **Unspent** budget increases next month's available; **overspending** reduces it
  (carry-in goes negative). This matches the "roll over leftovers" decision.
- `over-budget(c, m)` is true when `spent(c, m) > available(c, m)` → show red and
  "over by €X" where X = spent − available. The transaction is still recorded
  (warn-but-allow).
- Implementation note: compute carry chains from the **earliest month with data or a
  budget**, forward. Cache per-(category, month) results in memory; invalidate when
  any transaction or budget in or before that month changes.
- **Open question to confirm during build:** should carry-in start from the month a
  category's budget was first set, or from the first transaction? Default: **from the
  first month the category has either a budget or a transaction.** **[default]**

---

## 6. Views (screens) for v1 **[decided — all four]**

1. **Monthly dashboard** — selected month: total income vs. total spending, net
   (income − spending), overall budget health (sum planned vs. sum spent), and a
   short list of recent transactions. Month switcher (prev/next).
2. **Transaction list** — full ledger; filter by month/type/category; sort by date;
   inline quick-add and edit/delete.
3. **Budget overview** — per expense category for the selected month: planned vs.
   spent vs. remaining as bars, with carry-in shown and over-budget categories in
   red.
4. **Spending charts** — category breakdown (pie or bar) for the month, and a
   spending trend across recent months (line/bar). Charts read derived totals only.

All views operate on a **currently-selected month** shared across the app.

### Optional cross-cutting
- A persisted **opening balance** setting so net balance is meaningful:
  `balance = openingBalance + Σ income − Σ expense`. **[default]**

---

## 7. Non-functional & technical requirements

- **Stack (fixed by CLAUDE.md):** TypeScript strict, React SPA, Vite,
  `localStorage` persistence behind a thin storage layer (`src/lib/storage.ts`) —
  all reads/writes go through it so a future backend touches one file.
- **Types first** in `src/types/`. Make illegal states unrepresentable: discriminated
  union for transaction `type`; consider a branded `Minor` type for money and a
  `YYYY-MM` / `YYYY-MM-DD` string brand for periods/dates.
- **Money formatting** centralised in one util (parse decimal→minor, format
  minor→€) and used at the UI edge only.
- **No data loss:** schema changes to `localStorage` need a version key + migration
  path, since user data is the whole value of the app.
- **Local-first, offline:** no network calls required to use the app.

### Suggested type sketch (to refine in code)
```ts
type Minor = number & { readonly __brand: 'Minor' };        // integer cents
type IsoDate = string & { readonly __brand: 'IsoDate' };     // 'YYYY-MM-DD'
type Month = string & { readonly __brand: 'Month' };         // 'YYYY-MM'

interface Category { id: string; name: string; kind: 'income' | 'expense'; archived: boolean; }
interface Transaction {
  id: string; date: IsoDate; amountMinor: Minor; currency: 'EUR';
  type: 'income' | 'expense'; categoryId: string; note?: string;
  sourceRuleId?: string;
}
interface Budget { categoryId: string; month: Month; plannedMinor: Minor; }
interface RecurringRule {
  id: string; type: 'income' | 'expense'; amountMinor: Minor; categoryId: string;
  note?: string; dayOfMonth: number; startDate: IsoDate; endDate?: IsoDate;
}
```

---

## 8. Acceptance criteria (v1 "done")

- [ ] Can add/edit/delete income and expense transactions in EUR; amounts stored as
      integer minor units (verified: no float in storage).
- [ ] Categories come preloaded, can be added/renamed/archived; archived ones keep
      history.
- [ ] A recurring rule (e.g. salary on the 25th, rent on the 1st) back-fills past
      occurrences and generates the current month's entries.
- [ ] Per expense category per month: spent, available (incl. carry-in), remaining,
      % used, and an over-budget warning are shown and correct against the §5 math.
- [ ] Overspending is allowed and flagged red; leftover budget visibly rolls into the
      next month's available.
- [ ] All four views render and share one selected month; charts/totals are derived
      from transactions, not stored.
- [ ] Reloading the page preserves all data (localStorage).

---

## 9. Deferred backlog (post-v1)

Savings goals · investments · multiple accounts + internal transfers (which must not
count as income/expense) · multi-currency + FX · CSV import · weekly/custom budget
periods · cloud sync / backend.
