# TASK-010: Transaction Management UI

## Metadata
- **Track**: Domain Logic
- **Priority**: P0 (Critical - primary user interaction)
- **Estimate**: 4-5 hours
- **Dependencies**: TASK-004, TASK-005, TASK-008, TASK-009
- **Blocks**: TASK-011 (budget page needs transactions to display)
- **Status**: Blocked by TASK-004, TASK-005, TASK-008, TASK-009

## Objective
Build the Transactions page with a sortable/filterable table, add/edit/delete transaction forms, and quick-entry features. This is the most frequently used screen in the app.

## Acceptance Criteria
- [ ] Table view: date, description, category, account, amount, reconciled checkbox, actions
- [ ] Sort by: date (default desc), amount, category, account
- [ ] Filter by: date range, category, account, reconciled status
- [ ] "Add Transaction" button opens form (modal or slide-out)
- [ ] Form fields: date, amount, category (select), account (select), description, reconciled (checkbox)
- [ ] Form validation: date valid, amount numeric and non-zero, category and account selected
- [ ] Edit transaction: click row or edit icon, populate form, save
- [ ] Delete transaction: confirmation, remove and recalculate budget
- [ ] Pagination or virtual scrolling for large transaction lists (100+ items)
- [ ] Empty state with call-to-action to add first transaction

## Technical Notes
- Date picker: HTML5 `<input type="date">` or library like `react-datepicker`
- Table library: `react-table` (TanStack Table v8) for sorting/filtering, or build custom
- Mobile: consider card layout instead of table for narrow screens
- Reconciled flag: indicates transaction cleared in bank (useful for balancing)
- Negative amounts for income: allow negative values or separate "type" field (expense/income)

## Implementation Hints
```typescript
// Example filter state
interface TransactionFilters {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  reconciled?: boolean;
}

function filterTransactions(transactions: Transaction[], filters: TransactionFilters) {
  return transactions.filter(tx => {
    if (filters.dateFrom && tx.date < filters.dateFrom) return false;
    if (filters.dateTo && tx.date > filters.dateTo) return false;
    if (filters.categoryId && tx.categoryId !== filters.categoryId) return false;
    if (filters.accountId && tx.accountId !== filters.accountId) return false;
    if (filters.reconciled !== undefined && tx.reconciled !== filters.reconciled) return false;
    return true;
  });
}
```

## Risks & Considerations
- **High risk**: Complex UI with many interactions
- Performance: rendering 1000+ transactions may be slow (virtualize or paginate)
- UX: quick entry is critical (keyboard shortcuts, tab order, autofocus)
- Bulk operations: select multiple transactions, bulk delete/edit (nice-to-have, not MVP)
- Transaction splits: one transaction, multiple categories (future feature, skip for MVP)

## Definition of Done
- All CRUD operations work
- Sorting and filtering functional
- Form validation prevents bad data
- Responsive: usable on mobile
- At least one test: add transaction, filter by category, verify result
- Commit message: "feat: add transaction management UI with sorting and filtering"
