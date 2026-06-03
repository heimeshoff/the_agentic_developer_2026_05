# TASK-006: Data Seeding and Sample Data

## Metadata
- **Track**: Storage
- **Priority**: P1 (High - enables demo and testing)
- **Estimate**: 1-2 hours
- **Dependencies**: TASK-005
- **Blocks**: None (quality-of-life improvement)
- **Status**: Blocked by TASK-005

## Objective
Create a seed data utility that populates the app with realistic sample accounts, categories, transactions, and budgets. This enables immediate testing and demonstration without manual data entry.

## Acceptance Criteria
- [ ] Seed function creates 2-3 accounts (checking, savings, credit card)
- [ ] Seed function creates 8-12 categories (groceries, rent, utilities, entertainment, etc.)
- [ ] Seed function creates 20-30 transactions spanning current and previous month
- [ ] Seed function creates budget for current month with realistic amounts
- [ ] Seed data uses realistic values (e.g., rent $1500, groceries $400, etc.)
- [ ] Seed function is idempotent (can run multiple times without duplicates)
- [ ] "Load Sample Data" button in Settings page (or dev-only route)
- [ ] "Clear All Data" button for resetting storage

## Technical Notes
- Use fixed IDs for seed data to ensure idempotency (e.g., `account-seed-1`)
- Include transactions that test edge cases: negative balances, large amounts, refunds
- Add variety: some categories over budget, some under, some with rollover enabled
- Consider date distribution: cluster some transactions, spread others evenly
- Document seed data schema in code comments for future reference

## Implementation Hints
```typescript
export async function seedData(storage: StorageAdapter) {
  // Check if seed data already exists
  const existingAccounts = await storage.list('accounts');
  if (existingAccounts.length > 0) {
    console.warn('Seed data already exists, skipping');
    return;
  }
  
  const checkingAccount = { id: 'seed-checking', name: 'Main Checking', ... };
  await storage.save('accounts', checkingAccount.id, checkingAccount);
  
  // ... more seed data
}
```

Example categories: Groceries, Dining Out, Transportation, Utilities, Rent/Mortgage, Healthcare, Entertainment, Shopping, Savings, Income.

## Risks & Considerations
- **Low risk**: Nice-to-have feature
- Seed data should reflect realistic spending patterns for credibility
- Include some "interesting" scenarios: overspent category, unused category, large one-time expense
- Consider multiple seed profiles (single person, family, etc.) if time permits

## Definition of Done
- Seed function successfully populates empty app with data
- Sample data renders correctly in all UI screens
- Clear data function removes all storage and resets app
- Documentation includes sample data schema and usage instructions
- Commit message: "feat: add sample data seeding and clear data utilities"
