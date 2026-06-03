# TASK-012: Dashboard and Summary View

## Metadata
- **Track**: UI
- **Priority**: P0 (Critical - landing page)
- **Estimate**: 3-4 hours
- **Dependencies**: TASK-004, TASK-008, TASK-011
- **Blocks**: None (standalone feature)
- **Status**: Blocked by TASK-004, TASK-008, TASK-011

## Objective
Build the Dashboard (home page) showing high-level financial overview: total balance across accounts, budget summary for current month, recent transactions, and quick actions. This is the first screen users see and sets the tone for the app.

## Acceptance Criteria
- [ ] Summary cards: total balance, budgeted this month, spent this month, remaining this month
- [ ] "Budget Health" indicator: percentage of month elapsed vs. percentage of budget spent
- [ ] Top 3 categories by spending (current month)
- [ ] Overspent categories alert: highlight categories exceeding budget
- [ ] Recent transactions list (last 5-10), with link to full transactions page
- [ ] Quick action buttons: "Add Transaction", "View Budget", "View Accounts"
- [ ] Responsive grid layout: cards stack on mobile, side-by-side on desktop

## Technical Notes
- Reuse components from other pages (transaction row, category badge, etc.)
- Budget health formula: `(daysElapsed / daysInMonth) vs (spent / budgeted)` 
  - If spending pace > time pace, warn "spending too fast"
- Use skeleton loaders or shimmer effect while data loads (better UX than blank screen)
- Consider a mini chart showing spending trend over last 7/30 days (optional)

## Implementation Hints
```typescript
// Example budget health calculation
function calculateBudgetHealth(spent: number, budgeted: number, currentDate: Date) {
  const now = currentDate.getDate();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const timeElapsedRatio = now / daysInMonth;
  const spentRatio = spent / budgeted;
  
  if (spentRatio > timeElapsedRatio + 0.1) {
    return { status: 'warning', message: 'Spending faster than planned' };
  }
  return { status: 'ok', message: 'On track' };
}
```

Dashboard layout:
- Top row: 4 summary cards (balance, budgeted, spent, remaining)
- Middle: Budget health gauge + top categories
- Bottom: Recent transactions + quick actions

## Risks & Considerations
- **Medium risk**: Dashboard pulls data from multiple sources, ensure performance
- Empty state: if no data, show onboarding prompts (e.g., "Add your first account")
- Budget health: formula may need tuning based on user feedback (iteration expected)
- Overloading: don't cram too much info; prioritize clarity over density

## Definition of Done
- Dashboard renders all sections with real data
- Summary calculations accurate (cross-check with Budget page)
- Quick actions navigate to correct pages
- Responsive: mobile layout looks good
- No performance issues (dashboard loads in < 1s)
- Commit message: "feat: add dashboard with summary cards and budget health indicator"
