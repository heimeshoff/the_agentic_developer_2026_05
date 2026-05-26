# TASK-002: Core Domain Model - Foundation Types

## Metadata
- **Track**: Foundation
- **Priority**: P0 (Critical - blocks domain logic)
- **Estimate**: 3-4 hours
- **Dependencies**: TASK-001
- **Blocks**: TASK-005, TASK-006, TASK-007, TASK-008
- **Status**: Blocked by TASK-001

## Objective
Define the foundational TypeScript types and interfaces for the budget domain model, including Account, Category, Transaction, and Budget entities. This establishes the type system for the entire application.

## Acceptance Criteria
- [ ] `Account` type defined with ID, name, type (checking/savings/credit), balance, currency
- [ ] `Category` type defined with ID, name, budget amount, rollover flag, icon/color
- [ ] `Transaction` type defined with ID, date, amount, category, account, description, reconciled flag
- [ ] `Budget` type defined with month, categories, overall totals
- [ ] `Money` value object defined with amount + currency (avoid floating-point issues)
- [ ] All types exported from `src/domain/types.ts`
- [ ] JSDoc comments on all public types
- [ ] Unit tests for Money arithmetic (if utility functions included)

## Technical Notes
- Use branded types or value objects for IDs to prevent mixing different entity IDs
- Consider using `Decimal.js` or `big.js` for Money calculations (or store cents as integers)
- Make types immutable where possible (readonly properties)
- Use ISO 8601 date strings (`YYYY-MM-DD`) for date fields
- Use ISO 4217 currency codes (`USD`, `EUR`, etc.)

## Implementation Hints
```typescript
// Example: branded ID type
type AccountId = string & { readonly __brand: 'AccountId' };

// Example: Money value object
interface Money {
  readonly amountCents: number; // Store as integer cents
  readonly currency: CurrencyCode;
}

// Example: immutable account
interface Account {
  readonly id: AccountId;
  readonly name: string;
  readonly type: 'checking' | 'savings' | 'credit';
  readonly balanceCents: number;
  readonly currency: CurrencyCode;
}
```

## Risks & Considerations
- **Medium risk**: Domain model changes are expensive later
- Floating-point precision: use integer cents or Decimal library
- Currency handling: start simple (single currency OK), plan for multi-currency expansion
- Date/time zones: store UTC, display local (consider `date-fns` or `Temporal` API when stable)
- Rollover logic: design Category type to support both rollover and reset-to-zero budgets

## Definition of Done
- All types compile without errors with `strict: true`
- Types exported and importable from other modules
- At least 3 unit tests for Money operations (add, subtract, compare)
- Documentation includes domain glossary (Account, Category, Transaction, Budget definitions)
- Commit message: "feat: define core domain types for budget model"
