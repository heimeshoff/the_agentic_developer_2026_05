# TASK-013: Category Management UI

## Metadata
- **Track**: UI
- **Priority**: P1 (High - needed for budget setup)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-004, TASK-008
- **Blocks**: TASK-011 (budget page needs categories)
- **Status**: Blocked by TASK-004, TASK-008

## Objective
Build the Categories management screen (or section within Settings) where users can add, edit, delete, and reorder budget categories. Support custom icons/colors for visual differentiation.

## Acceptance Criteria
- [ ] List view showing all categories with name, icon/color, default budget amount
- [ ] "Add Category" button opens form
- [ ] Form fields: name (text), default budget amount (number), icon (select or emoji picker), color (color picker), rollover enabled (checkbox)
- [ ] Form validation: name required and unique, budget amount >= 0
- [ ] Edit category: update fields, save
- [ ] Delete category: confirmation, check for transactions, warn if in use
- [ ] Drag-and-drop reordering (optional but nice UX)
- [ ] Preset categories: offer common categories on first use (Groceries, Rent, etc.)

## Technical Notes
- Icon options: emoji (simple), icon library (react-icons, lucide), or custom SVG
- Color picker: native `<input type="color">` or library like `react-colorful`
- Drag-and-drop: `react-beautiful-dnd` or `@dnd-kit/core` (optional, can skip for MVP)
- Category order: persist in storage, use for display order in budget and transaction forms
- Deleting category with transactions: either prevent delete or reassign transactions to "Uncategorized"

## Implementation Hints
```typescript
// Example category form
interface CategoryFormData {
  name: string;
  budgetAmountCents: number;
  icon: string; // emoji or icon name
  color: string; // hex color
  rolloverEnabled: boolean;
}

// Example validation
function validateCategory(data: CategoryFormData, existingCategories: Category[]) {
  const errors: string[] = [];
  if (!data.name.trim()) errors.push('Name is required');
  if (existingCategories.some(c => c.name === data.name)) errors.push('Name must be unique');
  if (data.budgetAmountCents < 0) errors.push('Budget amount cannot be negative');
  return errors;
}
```

## Risks & Considerations
- **Low risk**: Straightforward CRUD UI
- Icon/color selection can be time-consuming; start simple (emoji only) and enhance later
- Category in use: handle gracefully (warn, prevent delete, or allow with reassignment)
- Preset categories: useful for onboarding but can be skipped if time is short

## Definition of Done
- All CRUD operations work
- Categories persist and appear in transaction/budget forms
- Form validation works
- Optional: drag-and-drop reordering functional
- At least one test: add category, verify it appears in list
- Commit message: "feat: add category management UI with icons and colors"
