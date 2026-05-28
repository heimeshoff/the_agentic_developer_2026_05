# Budgeting Feature Specification

## 1. Feature Overview

- **Feature Name:** Budgeting
- **Category:** Budgeting
- **Priority:** High (Critical - core personal finance management functionality)
- **One-Sentence Description:** Plan and allocate funds across different spending categories to control expenses and achieve financial goals.

## 2. Business Value

### What problem does this solve?
- Users struggle to control spending without a clear plan for where money should go
- Overspending in certain areas can derail financial goals and create stress
- Without budgets, users react to spending rather than proactively planning
- Makes it difficult to identify areas where spending can be reduced

### Who benefits from this feature?
- Primary: Anyone wanting to control spending and save money
- Specific segments:
  - People new to financial management who need structure
  - Families managing household expenses
  - Individuals saving for specific goals
  - People recovering from overspending or debt
  - Anyone trying to optimize their spending patterns

### How does it fit into the overall personal finance workflow?
- Foundation for financial discipline and control
- Links income allocation to spending categories
- Enables comparison of planned vs actual spending
- Supports savings and financial goal achievement
- Provides early warnings when overspending
- Facilitates financial decision-making

## 3. Detailed Requirements

### Functional Requirements

1. **Create Budget**
   - Define budget period (weekly, monthly, quarterly, yearly)
   - Set amounts for multiple categories
   - Use percentage-based or fixed amounts
   - Copy from previous budget
   - Use budget templates (e.g., 50/30/20 rule)

2. **Edit Budget**
   - Modify category amounts
   - Add or remove categories
   - Adjust budget period
   - Apply changes to current or future periods

3. **Delete Budget**
   - Remove budget configuration
   - Retain historical budget data
   - Confirm before deletion

4. **Budget Categories**
   - Pre-defined categories (Housing, Food, Transportation, Entertainment, etc.)
   - Custom category creation
   - Category grouping and hierarchy
   - Category-specific notes and guidelines

5. **Budget Tracking**
   - Real-time comparison of budget vs actual spending
   - Visual progress indicators (percentage used)
   - Remaining budget calculations
   - Overspending alerts and warnings

6. **Budget Analytics**
   - Budget adherence rate
   - Category-level performance
   - Historical budget vs actual comparisons
   - Spending trends within budget categories
   - Budget variance analysis

7. **Budget Templates**
   - Pre-built budget frameworks (50/30/20, Zero-based, Envelope method)
   - Customizable templates
   - Income-based automatic allocation
   - Save personal templates for reuse

8. **Rollover Settings**
   - Option to rollover unused budget to next period
   - Set rollover limits
   - Track accumulated rollover amounts

9. **Budget Recommendations**
   - Suggest budget amounts based on historical spending
   - Industry benchmark comparisons (e.g., housing should be <30% of income)
   - Identify categories where user over/under-budgets

### Non-Functional Requirements

1. **Performance**
   - Budget dashboard loads in under 1 second
   - Real-time updates when expenses recorded
   - Handle 50+ budget categories without lag

2. **Usability**
   - Create basic budget in under 2 minutes
   - Intuitive budget adjustment interface
   - Clear visual feedback on budget status
   - Mobile-friendly budget entry

3. **Flexibility**
   - Support various budgeting methodologies
   - Accommodate different time periods
   - Allow mid-period adjustments

### Business Rules and Constraints

1. Total budget allocations should not exceed expected income (warning if exceeded)
2. Budget amounts must be non-negative
3. Budget periods cannot overlap for same category
4. Category changes don't retroactively affect historical budgets
5. One active budget per user per period
6. Budget comparisons use transactions from same period
7. Deleted categories retain historical budget data

### Edge Cases to Handle

1. **Mid-Period Budget Changes** - User changes budget halfway through month
2. **Income Variability** - Income changes significantly month-to-month
3. **Shared Categories** - Multiple people contributing to same budget category
4. **Irregular Expenses** - Annual bills in monthly budget (prorated vs lump sum)
5. **New Categories** - Adding budget for category that didn't exist previously
6. **Zero-Based Budgeting** - Every dollar allocated, nothing unassigned
7. **Over-Budget Handling** - What happens when category exceeds budget?
8. **Budget Transfers** - Moving allocated funds between categories mid-period

## 4. User Stories

### Story 1: Create Monthly Budget
**As a** first-time user  
**I want** to quickly create a monthly budget based on my income  
**So that** I can start controlling my spending without extensive financial knowledge

**Acceptance Criteria:**
- User can select "Create Budget" option
- System asks for monthly income amount
- System suggests budget template (e.g., 50/30/20 rule)
- User can customize suggested amounts
- User can add/remove categories
- Budget is saved and becomes active immediately
- User sees budget dashboard with current period status

### Story 2: Monitor Budget Progress
**As a** budget-conscious user  
**I want** to see at a glance how much I've spent in each category  
**So that** I can make informed spending decisions and avoid overspending

**Acceptance Criteria:**
- Dashboard shows all budget categories
- Each category displays: budgeted amount, spent amount, remaining amount
- Visual progress bar shows percentage used
- Categories approaching limit (>80%) highlighted in warning color
- Over-budget categories highlighted in alert color
- Total budget vs total spending summary at top
- Updates in real-time when expenses added

### Story 3: Adjust Budget Mid-Month
**As a** user with changing circumstances  
**I want** to adjust my budget allocations during the current month  
**So that** I can adapt to unexpected expenses or changed priorities

**Acceptance Criteria:**
- User can access "Edit Budget" from dashboard
- Current amounts and spending shown for context
- User can modify any category amount
- System warns if total exceeds income
- User can choose to apply changes to current month only or future months
- Changes save immediately
- Updated budget immediately reflects in dashboard
- History tracks budget modifications

## 5. Data Model

### Budget Entity
```
Budget {
  id: UUID (primary key)
  user_id: UUID (foreign key to User)
  name: String(100) (e.g., "January 2026 Budget")
  period_type: Enum(WEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM)
  start_date: Date
  end_date: Date
  total_allocated: Decimal(precision: 10, scale: 2)
  expected_income: Decimal(precision: 10, scale: 2) (nullable)
  notes: Text (nullable)
  is_active: Boolean
  template_id: UUID (nullable, foreign key to BudgetTemplate)
  created_at: DateTime
  updated_at: DateTime
}
```

### Budget Category Allocation Entity
```
BudgetCategoryAllocation {
  id: UUID (primary key)
  budget_id: UUID (foreign key to Budget)
  category_id: UUID (foreign key to ExpenseCategory)
  allocated_amount: Decimal(precision: 10, scale: 2)
  spent_amount: Decimal(precision: 10, scale: 2) (calculated field)
  remaining_amount: Decimal(precision: 10, scale: 2) (calculated field)
  percentage_of_total: Decimal(precision: 5, scale: 2) (calculated)
  rollover_from_previous: Decimal(precision: 10, scale: 2) (nullable)
  allow_rollover: Boolean
  notes: Text (nullable)
  created_at: DateTime
  updated_at: DateTime
}
```

### Budget Template Entity
```
BudgetTemplate {
  id: UUID (primary key)
  user_id: UUID (nullable - null for system templates)
  name: String(100) (e.g., "50/30/20 Rule")
  description: Text
  is_system: Boolean
  is_public: Boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### Budget Template Allocation Entity
```
BudgetTemplateAllocation {
  id: UUID (primary key)
  template_id: UUID (foreign key to BudgetTemplate)
  category_id: UUID (foreign key to ExpenseCategory)
  percentage: Decimal(precision: 5, scale: 2) (nullable)
  fixed_amount: Decimal(precision: 10, scale: 2) (nullable)
  priority: Integer
  notes: Text (nullable)
}
```

### Budget History Entity
```
BudgetHistory {
  id: UUID (primary key)
  budget_id: UUID (foreign key to Budget)
  category_allocation_id: UUID (foreign key to BudgetCategoryAllocation)
  changed_by: UUID (foreign key to User)
  change_type: Enum(CREATED, MODIFIED, DELETED)
  old_amount: Decimal(precision: 10, scale: 2) (nullable)
  new_amount: Decimal(precision: 10, scale: 2) (nullable)
  reason: Text (nullable)
  created_at: DateTime
}
```

### Relationships
- User has many Budgets
- Budget has many BudgetCategoryAllocations
- ExpenseCategory has many BudgetCategoryAllocations
- BudgetTemplate has many BudgetTemplateAllocations
- Budget may be based on one BudgetTemplate
- BudgetHistory tracks changes to Budget and BudgetCategoryAllocation

## 6. User Interface Considerations

### Screens/Views Needed

1. **Budget Dashboard**
   - Current period budget summary
   - List of all budget categories with progress bars
   - Spent/Remaining/Budgeted for each category
   - Total budget overview card
   - Quick actions (Add Expense, Edit Budget, View Reports)
   - Period selector (This Month, Last Month, etc.)

2. **Create Budget Wizard**
   - Step 1: Choose period (monthly, weekly, etc.)
   - Step 2: Enter expected income (optional)
   - Step 3: Select template or start from scratch
   - Step 4: Customize category amounts
   - Step 5: Review and confirm
   - Progress indicator showing wizard steps

3. **Edit Budget Form**
   - List of categories with editable amount fields
   - Add/Remove category buttons
   - Total allocation calculator
   - Income vs allocation comparison
   - Save/Cancel buttons
   - Apply to current/future periods option

4. **Budget Category Detail**
   - Category name and budget amount
   - Transactions in this category (for current period)
   - Spending timeline (chart showing spending rate)
   - Notes and guidelines for category
   - Edit allocation button

5. **Budget Templates Library**
   - List of available templates (system + user-created)
   - Template preview (shows categories and percentages)
   - Apply template button
   - Create custom template option

6. **Budget Analytics**
   - Budget vs actual comparison chart (by month)
   - Category performance breakdown
   - Budget adherence score/percentage
   - Overspending categories highlight
   - Recommendations for adjustment

### Key Interactions and Workflows

**Quick Budget Setup:**
1. User taps "Create Budget"
2. System asks for monthly income
3. System suggests 50/30/20 template
4. User reviews and accepts
5. Budget created with default categories

**Detailed Budget Creation:**
1. User selects "Create Budget"
2. User chooses period type (monthly)
3. User enters expected income
4. User browses templates or chooses "Custom"
5. User adds categories and amounts
6. System shows total and % of income
7. User adjusts as needed
8. User saves budget

**Daily Monitoring:**
1. User opens app to budget dashboard
2. User sees at-a-glance status of all categories
3. User identifies categories approaching limits
4. User decides whether to proceed with planned purchase

### Mobile vs Desktop Considerations

**Mobile:**
- Simplified dashboard with essential categories first
- Swipe to reveal more details
- Large touch targets for category editing
- Simplified budget creation wizard
- Push notifications for budget alerts
- Widget showing budget status

**Desktop:**
- Full table view of all categories
- Inline editing of amounts
- Side-by-side comparison views
- Advanced analytics and charting
- Keyboard shortcuts for navigation
- Multi-budget comparison

## 7. Accessibility Requirements (WCAG 2.1 AA)

### Keyboard Navigation Requirements
- All budget amounts editable via keyboard
- Tab through categories in logical order
- Arrow keys to navigate between fields
- Enter to save, Escape to cancel
- Keyboard shortcuts for common actions (N for new, E for edit)
- Skip to main content link

### Screen Reader Considerations
- Category progress announced as "Category name: X dollars spent of Y budgeted, Z remaining, W percent used"
- Over-budget status announced clearly
- Form validation errors announced immediately
- Budget creation wizard announces current step
- Success confirmations announced
- Dynamic updates announced (when expense added and budget changes)

### Color Contrast and Visual Requirements
- Progress bars use patterns in addition to colors
- Over-budget indication uses icon + color + text
- All text meets 4.5:1 contrast ratio
- Visual focus indicators on all interactive elements
- Charts include text labels and data tables as alternatives
- Percentage indicators readable at all zoom levels

### Focus Management Needs
- Focus moves to first field when opening budget form
- Focus returns to trigger when closing modal
- Focus stays within modal when open
- Tab order follows visual layout
- Currently focused category highlighted clearly

### Additional Considerations
- Amount fields support screen reader-friendly number entry
- Currency symbols announced correctly
- Percentage calculations announced
- Template names descriptive and meaningful
- Error messages provide specific guidance

## 8. Technical Considerations

### API Endpoints Needed

**GET /api/budgets**
- Query params: userId, period, active
- Returns: List of budgets

**POST /api/budgets**
- Body: Budget configuration with category allocations
- Returns: Created budget

**GET /api/budgets/{id}**
- Returns: Budget details with all category allocations

**PUT /api/budgets/{id}**
- Body: Updated budget data
- Returns: Updated budget

**DELETE /api/budgets/{id}**
- Returns: Success confirmation

**GET /api/budgets/{id}/status**
- Returns: Current budget status (spent, remaining for each category)

**GET /api/budgets/{id}/analytics**
- Query params: compareWith (previous period, last year, etc.)
- Returns: Budget performance analytics

**GET /api/budget-templates**
- Returns: Available budget templates

**POST /api/budget-templates**
- Body: Template configuration
- Returns: Created template

**POST /api/budgets/{id}/apply-template**
- Body: templateId, adjustments
- Returns: Updated budget with template applied

### External Integrations
- None required for MVP
- Future: Financial advisor tools, budgeting apps (YNAB, Mint export)

### Performance Considerations
- Cache current budget for logged-in user
- Denormalize spent_amount to avoid real-time calculation
- Background job to update spent amounts when expenses added
- Index on user_id, budget period dates, is_active
- Pagination not needed for categories (typically <50 per budget)
- Cache budget templates (rarely change)

### Security Considerations
- Users can only access their own budgets
- Validate all amounts are valid numbers
- Prevent negative budget amounts
- Audit trail for budget changes
- Rate limiting on budget creation (prevent spam)

## 9. Testing Strategy

### Unit Test Scenarios
1. Budget total calculation includes all category allocations
2. Percentage calculations correct
3. Remaining amount = budgeted - spent
4. Over-budget detection works correctly
5. Budget period validation (start < end)
6. Template application correctly sets category amounts

### Integration Test Scenarios
1. Create budget and verify in database
2. Add expense and verify budget spent amount updates
3. Edit budget and verify history recorded
4. Delete budget and verify cascading deletes handled
5. Apply template and verify all categories created
6. Budget status endpoint returns accurate real-time data

### Accessibility Test Checklist
- [ ] All forms keyboard navigable
- [ ] Screen reader announces budget status correctly
- [ ] Progress bars have text alternatives
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Over-budget alerts announced to screen readers
- [ ] Form errors announced and actionable
- [ ] Wizard navigation accessible

### Manual Testing Scenarios
1. Create budget with 50/30/20 template
2. Create custom budget from scratch
3. Edit budget mid-month and verify changes
4. Add expenses and watch budget update in real-time
5. Test over-budget scenario and verify alerts
6. Test budget rollover functionality
7. Compare budget vs actual over multiple months

## 10. Dependencies

### What other features must exist first?
1. **Expense Tracking** (BLOCKER) - Need expenses to track against budget
2. **Categories & Tags** (BLOCKER) - Budget allocations tied to categories
3. **User Authentication** (BLOCKER) - User-specific budgets
4. **Account Management** - Expenses come from accounts

### What features depend on this one?
1. **Financial Reports** - Budget vs actual reporting
2. **Notifications/Alerts** - Over-budget warnings
3. **Dashboard/Overview** - Budget summary display
4. **Financial Goals** - Budget adherence affects goal progress
5. **Savings Goals** - Budget savings category feeds savings

## 11. Open Questions

1. **Multiple Simultaneous Budgets** - Can user have personal + household budgets for same period?
2. **Budget Sharing** - Should couples/families share budgets?
3. **Automatic Adjustments** - Should system auto-adjust budget based on income changes?
4. **Budget Coaching** - Should app provide proactive tips for budget improvement?
5. **Irregular Expenses** - How to budget for annual expenses in monthly budget (prorate vs dedicated savings)?
6. **Budget Alerts Threshold** - At what percentage should warnings trigger (80%, 90%, 100%)?
7. **Historical Budget Edits** - Allow editing past budgets or lock after period ends?
8. **Budget Forecasting** - Project end-of-month position based on current spending rate?
9. **Budget Gamification** - Rewards/streaks for staying on budget?
10. **Budget Export** - Export budget to Excel/PDF for review or sharing?
