# TASK-011: Budget Planning UI

## Metadata
- **Track**: UI
- **Priority**: P0 (Critical - core feature)
- **Estimate**: 4-5 hours
- **Dependencies**: TASK-004, TASK-007, TASK-008, TASK-010
- **Blocks**: None (standalone feature)
- **Status**: Blocked by TASK-004, TASK-007, TASK-008, TASK-010

## Objective
Build the Budget page showing category-by-category breakdown: budgeted amount, spent, remaining, progress bars, and overspending warnings. Allow users to edit budget amounts and toggle rollover settings. This is the primary value proposition of the app.

## Acceptance Criteria
- [ ] Month selector: navigate previous/current/next months
- [ ] Category list: name, budgeted amount, spent amount, remaining amount, percentage bar
- [ ] Visual indicators: green (under budget), yellow (80%+ spent), red (over budget)
- [ ] Edit budget amount: inline or modal, save and recalculate
- [ ] Rollover toggle per category: enable/disable rollover for next month
- [ ] Overall summary: total budgeted, total spent, total remaining
- [ ] "Copy from last month" button to duplicate previous budget
- [ ] Empty state: prompt to create categories and set budgets

## Technical Notes
- Use budget calculation engine from TASK-007 to compute all values
- Progress bars: CSS with dynamic width (e.g., `style={{ width: `${percentage}%` }}`)
- Color coding: use CSS classes or inline styles based on percentage thresholds
- Month navigation: use date arithmetic (add/subtract 1 month) with proper month rollover
- Consider "Budget vs. Actual" chart (bar chart or line chart) if time permits

## Implementation Hints
```typescript
// Example category row component
function CategoryRow({ category, status }: { category: Category; status: CategoryStatus }) {
  const colorClass = 
    status.isOverBudget ? 'text-red-600' :
    status.percentageUsed > 80 ? 'text-yellow-600' :
    'text-green-600';
  
  return (
    <div className="category-row">
      <span>{category.name}</span>
      <span>${(category.budgetAmountCents / 100).toFixed(2)}</span>
      <span className={colorClass}>${(status.spentCents / 100).toFixed(2)}</span>
      <ProgressBar percentage={status.percentageUsed} />
      <button onClick={() => editBudget(category)}>Edit</button>
    </div>
  );
}
```

## Risks & Considerations
- **High risk**: Rollover logic display and editing is complex
- Rollover visualization: how to show previous month's rollover contribution? (tooltip or inline text)
- Editing mid-month: should budget changes apply retroactively? (Decision: yes, recalculate immediately)
- Multiple months: how far back to allow navigation? (Limit to 12 months or all data)
- Chart library: Recharts, Chart.js, or Victory (if visualizations added)

## Definition of Done
- Budget page displays all categories with correct calculations
- Editing budget amounts works and persists
- Rollover toggle saves and affects next month's calculations (verify in next month view)
- Month navigation works forward and backward
- Responsive layout: works on mobile
- At least one test: load budget, verify calculations match expectations
- Commit message: "feat: add budget planning UI with rollover and month navigation"
