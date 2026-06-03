# TASK-009: Account Management UI

## Metadata
- **Track**: Domain Logic
- **Priority**: P1 (High - foundational UI)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-004, TASK-005, TASK-008
- **Blocks**: TASK-010 (transactions need accounts)
- **Status**: Blocked by TASK-004, TASK-005, TASK-008

## Objective
Build the Accounts page where users can view, add, edit, and delete bank accounts. This is the first fully-functional CRUD UI in the app.

## Acceptance Criteria
- [ ] List view showing all accounts with name, type, balance, and actions
- [ ] "Add Account" button opens a form (modal or inline)
- [ ] Form fields: name (text), type (select: checking/savings/credit), initial balance (number), currency (default USD)
- [ ] Form validation: name required, balance numeric, currency valid
- [ ] Edit account: click row or edit button, populate form, save updates
- [ ] Delete account: confirmation dialog, remove from storage
- [ ] Balance displayed with currency formatting (e.g., $1,234.56)
- [ ] Empty state: helpful message when no accounts exist

## Technical Notes
- Use controlled form components (React Hook Form recommended for complex forms)
- Format currency with `Intl.NumberFormat` or library like `dinero.js`
- Disable delete if account has transactions (or warn + cascade delete)
- Consider account icons/colors for visual differentiation
- Mobile-friendly: forms should be thumb-reachable on small screens

## Implementation Hints
```typescript
// Example currency formatting
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formattedBalance = formatter.format(account.balanceCents / 100);
```

Form libraries:
- React Hook Form: great for validation and performance
- Formik: more verbose but feature-rich
- Plain controlled inputs: fine for simple forms

## Risks & Considerations
- **Low risk**: Standard CRUD UI
- Deleting account with transactions: define behavior (prevent, cascade, or mark inactive)
- Account balance vs. calculated balance: if transactions exist, should balance be computed from transactions? (Decision: manual balance is "truth", transactions track changes)
- Multi-currency: start with single currency, add selector later if time permits

## Definition of Done
- All CRUD operations work and persist
- Form validation prevents invalid data
- UI matches design intent (clean, usable, responsive)
- At least one test: render list, add account, verify it appears
- Commit message: "feat: add account management UI with CRUD operations"
