# TASK-007: Budget Calculation Engine

## Metadata
- **Track**: Domain Logic
- **Priority**: P0 (Critical - core business logic)
- **Estimate**: 4-5 hours
- **Dependencies**: TASK-002
- **Blocks**: TASK-008, TASK-011
- **Status**: Blocked by TASK-002

## Objective
Implement the core budget calculation logic: compute spent/remaining amounts per category, handle rollover from previous months, calculate overall budget health, and detect overspending. This is the heart of the domain model.

## Acceptance Criteria
- [ ] Function: `calculateCategoryStatus(category, transactions)` returns spent, remaining, percentage
- [ ] Function: `calculateBudgetSummary(budget, transactions)` returns overall totals
- [ ] Function: `applyRollover(previousBudget, currentBudget)` handles rollover logic
- [ ] Support for rollover categories: unused budget carries to next month
- [ ] Support for reset categories: budget resets to defined amount each month
- [ ] Overspending detection: flag categories exceeding budget
- [ ] Percentage calculations: spent/budget ratio (0-100+%)
- [ ] Unit tests covering all calculation scenarios (positive, negative, zero, rollover)

## Technical Notes
- Pure functions: no side effects, easily testable
- Handle edge cases: no budget set (treat as unlimited?), negative transactions (refunds), zero budget
- Rollover logic: `currentMonth.remaining = previousMonth.remaining + currentMonth.budgeted - currentMonth.spent`
- Consider partial month calculations (e.g., mid-month budget adjustments)
- Use Money type consistently to avoid floating-point errors

## Implementation Hints
```typescript
interface CategoryStatus {
  categoryId: string;
  budgetedCents: number;
  spentCents: number;
  remainingCents: number;
  percentageUsed: number; // 0-100+
  isOverBudget: boolean;
}

function calculateCategoryStatus(
  category: Category,
  transactions: Transaction[],
  rolloverFromPrevious: number = 0
): CategoryStatus {
  const spent = transactions
    .filter(t => t.categoryId === category.id)
    .reduce((sum, t) => sum + t.amountCents, 0);
  
  const budgeted = category.budgetAmountCents + rolloverFromPrevious;
  const remaining = budgeted - spent;
  const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  
  return {
    categoryId: category.id,
    budgetedCents: budgeted,
    spentCents: spent,
    remainingCents: remaining,
    percentageUsed,
    isOverBudget: remaining < 0,
  };
}
```

## Risks & Considerations
- **High risk**: Complex rollover logic with many edge cases
- Rollover back-fill: how to initialize rollover for first month? (assume zero)
- Multi-month rollover: track indefinitely or cap at N months?
- Refunds and credits: do they "unspend" budget? (Yes, subtract from spent)
- Income categories: some apps treat income as negative expenses (consider later)

## Definition of Done
- All calculation functions return correct results
- At least 10 unit tests covering edge cases
- Test scenarios: zero budget, no transactions, all spent, overspent, rollover with surplus, rollover with deficit
- Documentation includes calculation formulas and rollover rules
- Commit message: "feat: implement budget calculation engine with rollover support"
