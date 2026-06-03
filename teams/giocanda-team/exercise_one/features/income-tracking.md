# Income Tracking Feature Specification

## 1. Feature Overview

- **Feature Name:** Income Tracking
- **Category:** Income
- **Priority:** High (Critical - foundational for personal finance management)
- **One-Sentence Description:** Monitor and categorize all money coming into accounts from various sources to provide a complete picture of financial inflows.

## 2. Business Value

### What problem does this solve?
- Users need visibility into all sources of income to make informed financial decisions
- Without accurate income tracking, users cannot effectively budget, save, or plan for the future
- Many users have multiple income streams (salary, freelance, investments, side hustles) that need unified tracking

### Who benefits from this feature?
- Primary: All users who need to manage personal finances
- Specific segments:
  - Salaried employees with regular paychecks
  - Freelancers with irregular income
  - Retirees with multiple income sources (pensions, investments, Social Security)
  - Side hustlers juggling multiple income streams

### How does it fit into the overall personal finance workflow?
- Foundation for budgeting (can't plan spending without knowing income)
- Enables accurate cash flow analysis
- Powers income vs expense comparisons
- Supports tax planning and documentation
- Feeds into net worth calculations and financial goal planning

## 3. Detailed Requirements

### Functional Requirements
1. **Add Income Transaction**
   - Capture amount, date, source, and description
   - Support one-time and recurring income
   - Allow categorization (salary, freelance, investment returns, gifts, etc.)
   - Attach to specific account
   - Add optional notes/memo

2. **Edit Income Transaction**
   - Modify any field of existing income entry
   - Maintain audit trail of changes

3. **Delete Income Transaction**
   - Soft delete with recovery option
   - Confirm before permanent deletion

4. **View Income History**
   - List all income transactions chronologically
   - Filter by date range, source, category, account
   - Search by description or amount
   - Sort by various fields

5. **Recurring Income Setup**
   - Define frequency (weekly, bi-weekly, monthly, quarterly, annually)
   - Set start and optional end date
   - Auto-generate transactions based on schedule
   - Handle irregular dates (e.g., last day of month, 15th and last day)

6. **Income Categories**
   - Pre-defined categories (Salary, Freelance, Business Income, Investment Returns, Rental Income, Gifts, Other)
   - Custom category creation
   - Category-based reporting

7. **Income Analytics**
   - Total income by period (day, week, month, quarter, year)
   - Income by source/category breakdown
   - Average income calculations
   - Income trends over time
   - Regular vs irregular income comparison

### Non-Functional Requirements
1. **Performance**
   - Load income list (<1000 entries) in under 1 second
   - Add/edit operations complete in under 500ms
   - Support at least 10,000 income transactions without performance degradation

2. **Usability**
   - Income entry form completable in under 30 seconds
   - Mobile-friendly input for on-the-go entry
   - Smart defaults based on user patterns

3. **Data Integrity**
   - Validate all amounts are positive numbers
   - Ensure dates are valid and not in far future
   - Prevent duplicate entries (warn user of similar recent entries)

4. **Security**
   - Encrypt sensitive income data at rest
   - Mask income amounts in screenshots/sharing (optional)
   - Secure against SQL injection and XSS attacks

### Business Rules and Constraints
1. Income amounts must be positive (>0)
2. Income date cannot be more than 1 year in the future
3. Recurring income can only be edited going forward (not retroactively)
4. Category is required (defaults to "Other" if not specified)
5. Each income entry must be associated with an account
6. Currency must match account currency (or support conversion)

### Edge Cases to Handle
1. **Bulk income import** - Multiple income entries at once (e.g., CSV import)
2. **Split income** - Single payment split across multiple categories
3. **Income corrections** - Adjusting previously entered income (e.g., bonus adjustment)
4. **Foreign currency income** - Income received in different currency than primary
5. **Advance/prepayment** - Income received for future period
6. **Irregular recurring income** - Salary that varies each month (e.g., commission)
7. **Negative income** - Refunds or chargebacks (should these be handled as negative expenses instead?)

## 4. User Stories

### Story 1: Track Regular Salary
**As a** salaried employee  
**I want** to automatically record my bi-weekly paycheck  
**So that** I don't have to manually enter it each time and can accurately track my regular income

**Acceptance Criteria:**
- User can set up recurring income with bi-weekly frequency
- System automatically creates income entry every 2 weeks
- User receives notification when new income is recorded
- User can view history of all salary payments
- User can edit future occurrences if salary changes

### Story 2: Log Freelance Income
**As a** freelance consultant  
**I want** to quickly log client payments when they arrive  
**So that** I can track my irregular income streams and know my current financial position

**Acceptance Criteria:**
- User can add one-time income entry in under 30 seconds
- User can specify client/source name
- User can add project notes or invoice reference
- User can categorize as "Freelance Income"
- Income appears immediately in transaction history and totals

### Story 3: Analyze Income Trends
**As a** user with multiple income sources  
**I want** to see how my income has changed over the past year  
**So that** I can identify trends and plan for future income variations

**Acceptance Criteria:**
- User can view income chart by month for selected date range
- User can filter by income category or source
- System shows total income, average, and trend direction
- User can compare current period to previous period
- System highlights significant changes (>20% variance)

## 5. Data Model

### Income Transaction Entity
```
IncomeTransaction {
  id: UUID (primary key)
  user_id: UUID (foreign key to User)
  account_id: UUID (foreign key to Account)
  amount: Decimal(precision: 10, scale: 2)
  currency: String(3) (ISO 4217 code, e.g., USD, EUR)
  transaction_date: Date
  description: String(255)
  category_id: UUID (foreign key to IncomeCategory)
  source: String(100) (e.g., "Acme Corp", "Client XYZ")
  is_recurring: Boolean
  recurring_config_id: UUID (nullable, foreign key to RecurringConfig)
  notes: Text (nullable)
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime (nullable, for soft delete)
}
```

### Recurring Income Configuration Entity
```
RecurringConfig {
  id: UUID (primary key)
  user_id: UUID (foreign key to User)
  name: String(100) (e.g., "Monthly Salary")
  amount: Decimal(precision: 10, scale: 2)
  currency: String(3)
  account_id: UUID (foreign key to Account)
  category_id: UUID (foreign key to IncomeCategory)
  source: String(100)
  frequency: Enum(WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, ANNUALLY)
  start_date: Date
  end_date: Date (nullable)
  next_occurrence: Date
  description: String(255)
  is_active: Boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### Income Category Entity
```
IncomeCategory {
  id: UUID (primary key)
  user_id: UUID (nullable - null for system categories)
  name: String(50)
  icon: String(50) (nullable, icon identifier)
  color: String(7) (nullable, hex color)
  is_system: Boolean (true for pre-defined categories)
  parent_category_id: UUID (nullable, for hierarchical categories)
  created_at: DateTime
}
```

### Relationships
- User has many IncomeTransactions
- Account has many IncomeTransactions
- IncomeCategory has many IncomeTransactions
- RecurringConfig generates many IncomeTransactions
- IncomeCategory can have many child categories (hierarchical)

## 6. User Interface Considerations

### Screens/Views Needed
1. **Income List View**
   - Chronological list of all income
   - Filter and search bar at top
   - Summary totals (selected period, total, average)
   - Quick add button (floating action button)

2. **Add Income Form**
   - Amount input (prominent, numeric keyboard on mobile)
   - Date picker (defaults to today)
   - Account selector dropdown
   - Category selector (with icons)
   - Source/description fields
   - Optional: Recurring income toggle
   - Notes field (expandable)
   - Save and Cancel buttons

3. **Recurring Income Setup**
   - All fields from Add Income Form
   - Frequency selector
   - Start date picker
   - Optional end date picker
   - Preview of next 3 occurrences

4. **Income Details View**
   - Full transaction details
   - Edit and Delete buttons
   - Related recurring config (if applicable)
   - Transaction history/audit log

5. **Income Analytics Dashboard**
   - Total income card (selected period)
   - Income by category chart (pie/donut)
   - Income trend chart (line/bar graph over time)
   - Income source breakdown
   - Regular vs irregular income comparison

### Key Interactions and Workflows

**Quick Add Workflow:**
1. User taps floating "+" button
2. Amount input appears with keyboard
3. User enters amount
4. Category selector shows common categories
5. User taps category
6. Transaction saves with smart defaults (today, primary account)

**Detailed Add Workflow:**
1. User taps "Add Income" button
2. Full form appears
3. User fills in all desired fields
4. User optionally toggles "Make Recurring"
5. If recurring, additional fields appear
6. User taps "Save"
7. System validates and confirms
8. User returns to list view with new entry visible

**Edit Workflow:**
1. User taps income transaction in list
2. Detail view appears
3. User taps "Edit" button
4. Form pre-filled with current values
5. User modifies desired fields
6. User taps "Save"
7. System validates and updates
8. User returns to detail view

### Mobile vs Desktop Considerations

**Mobile:**
- Prioritize touch-friendly targets (minimum 44x44 points)
- Use numeric keyboard for amount entry
- Implement swipe actions (swipe left to delete, right to edit)
- Use bottom sheets for forms
- Sticky summary header while scrolling
- Pull-to-refresh for updating list

**Desktop:**
- Show more data in table format
- Use hover states for additional information
- Keyboard shortcuts (N for new, E for edit, Del for delete)
- Multi-column layout for analytics
- Sidebar for filters (always visible)
- Inline editing capability

## 7. Accessibility Requirements (WCAG 2.1 AA)

### Keyboard Navigation Requirements
- All form fields must be keyboard accessible (Tab, Shift+Tab)
- Modal dialogs must trap focus appropriately
- Escape key closes modals/forms
- Enter key submits forms
- Keyboard shortcuts documented and customizable
- Skip navigation links for long lists

### Screen Reader Considerations
- All form fields have associated labels (not just placeholders)
- Amount input announces currency and decimal places
- Date pickers announce selected date in full format
- Category icons have text alternatives
- Form validation errors announced immediately
- Success confirmations announced
- Loading states announced ("Loading income transactions...")
- List items announce "Income from [source], [amount], [date]"

### Color Contrast and Visual Requirements
- Text contrast ratio at least 4.5:1 for body text
- Text contrast ratio at least 3:1 for large text (18pt+)
- Category colors meet contrast requirements
- Form field borders visible and distinguishable
- Focus indicators clearly visible (3:1 contrast, 2px minimum)
- Error states not indicated by color alone (use icons + text)
- Charts provide alternative text descriptions

### Focus Management Needs
- Focus moves to first form field when add/edit dialog opens
- Focus returns to trigger button when dialog closes
- Focus indicator clearly visible on all interactive elements
- Focus order follows logical reading order
- No keyboard traps
- Currently focused element always visible (no scroll hiding)

### Additional Considerations
- Animations can be disabled (respects prefers-reduced-motion)
- Text can be resized up to 200% without loss of functionality
- Touch targets at least 44x44 CSS pixels
- Form instructions provided before form fields
- Required fields clearly indicated (not just with asterisk)
- Time limits can be extended or disabled (for auto-save features)

## 8. Technical Considerations

### API Endpoints Needed

**GET /api/income**
- Query params: startDate, endDate, accountId, categoryId, limit, offset
- Returns: Paginated list of income transactions

**POST /api/income**
- Body: Income transaction data
- Returns: Created income transaction with ID

**GET /api/income/{id}**
- Returns: Single income transaction details

**PUT /api/income/{id}**
- Body: Updated income transaction data
- Returns: Updated income transaction

**DELETE /api/income/{id}**
- Returns: Success confirmation

**POST /api/income/recurring**
- Body: Recurring configuration data
- Returns: Created recurring config with ID

**GET /api/income/recurring**
- Returns: List of recurring income configurations

**PUT /api/income/recurring/{id}**
- Body: Updated recurring config
- Returns: Updated config

**DELETE /api/income/recurring/{id}**
- Query param: deleteExisting (boolean, whether to delete generated transactions)
- Returns: Success confirmation

**GET /api/income/analytics**
- Query params: startDate, endDate, groupBy (day/week/month/year)
- Returns: Aggregated income statistics

**GET /api/income/categories**
- Returns: List of income categories (system + user-defined)

**POST /api/income/categories**
- Body: New category data
- Returns: Created category

### External Integrations (if applicable)
- Bank API integration for automatic income detection
- Accounting software export (QuickBooks, FreshBooks)
- Tax software integration (TurboTax, H&R Block)
- Calendar integration for recurring income reminders

### Performance Considerations
- Database indexing on user_id, account_id, transaction_date, category_id
- Pagination for large transaction lists (50-100 items per page)
- Caching of category list (rarely changes)
- Debouncing of search/filter inputs (300ms delay)
- Lazy loading of analytics charts
- Background job for processing recurring income generation
- Consider materialized views for analytics queries

### Security Considerations
- Authenticate all API requests
- Authorize access (users can only see their own income)
- Validate all input (amount, date, strings)
- Parameterized queries to prevent SQL injection
- Rate limiting on API endpoints (prevent abuse)
- Audit log for sensitive operations (edit, delete)
- Data encryption at rest (database-level)
- HTTPS for all data transmission
- Consider PII masking in logs

## 9. Testing Strategy

### Unit Test Scenarios
1. **Income Transaction Creation**
   - Valid income transaction is created successfully
   - Invalid amount (negative, zero, non-numeric) is rejected
   - Invalid date (far future, invalid format) is rejected
   - Required fields validation works correctly

2. **Recurring Income Configuration**
   - Recurring config calculates next occurrence correctly
   - Different frequencies (weekly, monthly, etc.) work correctly
   - End date stops recurring generation
   - Inactive recurring configs don't generate transactions

3. **Income Calculations**
   - Total income calculation is accurate
   - Income by category aggregation is correct
   - Date range filtering works correctly
   - Currency conversion (if applicable) is accurate

4. **Business Logic**
   - Soft delete doesn't include deleted records in calculations
   - Duplicate detection works correctly
   - Category hierarchy is respected

### Integration Test Scenarios
1. **Income CRUD Operations**
   - Create income via API and verify database entry
   - Read income via API and verify response
   - Update income via API and verify changes
   - Delete income via API and verify soft delete

2. **Recurring Income Generation**
   - Scheduled job generates income on correct dates
   - Generated income has correct amount and category
   - Multiple recurring configs work independently
   - Editing recurring config affects future entries only

3. **Analytics Endpoints**
   - Analytics API returns correct aggregations
   - Date range filtering works end-to-end
   - Category filtering produces accurate results
   - Performance is acceptable with large datasets

4. **Cross-Feature Integration**
   - Income affects account balance correctly
   - Income appears in transaction history
   - Income is included in budget calculations
   - Income data exports correctly

### Accessibility Test Checklist
- [ ] All forms navigable with keyboard only
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA standards (use contrast checker tool)
- [ ] Focus indicators visible on all interactive elements
- [ ] Form validation errors announced to screen readers
- [ ] Modal dialogs trap focus and return focus on close
- [ ] Skip links work correctly
- [ ] Date pickers accessible with keyboard and screen reader
- [ ] Charts have text alternatives
- [ ] Zoom to 200% doesn't break layout or hide content
- [ ] Respects prefers-reduced-motion for animations
- [ ] Touch targets meet minimum size requirements

### Manual Testing Scenarios
1. **Happy Path**
   - Add regular salary as recurring income
   - Add one-time freelance payment
   - Edit income amount and verify update
   - Delete income and confirm soft delete
   - View income analytics and verify accuracy

2. **Edge Cases**
   - Add income with maximum allowed amount
   - Add income with many special characters in description
   - Create 50 income entries and verify performance
   - Add income on leap year date (Feb 29)
   - Add income with future date (within allowed range)

3. **Error Handling**
   - Attempt to add income with negative amount
   - Attempt to add income with invalid date
   - Submit form with missing required fields
   - Test network error during save operation
   - Test concurrent edits (two users editing same income)

4. **User Experience**
   - Time how long it takes to add income (should be <30 seconds)
   - Verify mobile keyboard shows numeric keypad for amount
   - Verify swipe actions work on mobile
   - Test pull-to-refresh
   - Verify loading states display appropriately

## 10. Dependencies

### What other features must exist first?
1. **Account Management** (BLOCKER)
   - Income must be associated with an account
   - Cannot add income without at least one account

2. **User Authentication** (BLOCKER)
   - Need to identify which user owns the income
   - Required for data security and privacy

3. **Categories & Tags** (BLOCKER)
   - Income categories must be defined
   - Default categories should exist

### What features depend on this one?
1. **Budgeting**
   - Budget planning requires knowing expected income
   - Income vs expense comparison needs income data

2. **Financial Reports**
   - Income is core component of financial health reports
   - Cash flow analysis requires income data

3. **Dashboard/Overview**
   - Dashboard shows total income summary
   - Trends and insights require income data

4. **Transaction History**
   - Income transactions appear in unified history
   - Search and filtering include income

5. **Financial Goals**
   - Goal progress calculation may include income
   - Savings rate requires income data

6. **Savings Goals**
   - Automatic savings based on income percentage
   - Savings calculations need income context

### Nice-to-Have (Not Blockers)
- **Data Visualization** - Enhanced charts for income
- **Export/Import** - Bulk income import
- **Notifications/Alerts** - Reminders for missing recurring income
- **Multi-currency Support** - Foreign currency income

## 11. Open Questions

1. **Recurring Income Variations**
   - How to handle salary that varies slightly each month (e.g., hourly * hours worked)?
   - Should system allow percentage variation (+/- 10%) for recurring income?
   - How to handle income that arrives on business days only (not weekends)?

2. **Income vs Transfers**
   - Should transfers between user's own accounts be tracked separately?
   - Is a transfer from savings to checking considered "income" for budgeting?

3. **Tax Implications**
   - Should income be tagged as taxable vs non-taxable?
   - Should system estimate tax withholding or net income?
   - Integration with tax reporting features?

4. **Income Splitting**
   - Should single income transaction be splittable across categories?
   - Example: Paycheck that includes salary + bonus + reimbursement

5. **Historical Data**
   - How far back should users be able to add income (unlimited, 1 year, 10 years)?
   - Should historical import be a separate flow?

6. **Multi-User Scenarios**
   - For shared household finances, how to handle income from multiple people?
   - Should income be tagged with earner/contributor?

7. **Negative Income**
   - How to handle income refunds, chargebacks, or corrections?
   - Should these be negative income or positive expenses?

8. **Income Forecasting**
   - Should system project future income based on recurring patterns?
   - How to handle seasonal income (e.g., tax refunds, annual bonuses)?

9. **Performance Thresholds**
   - What's the maximum number of income transactions a single user might have?
   - Should we implement archiving for very old transactions?

10. **Notification Preferences**
    - What income-related notifications do users want?
    - Missing recurring income alerts? Income milestones? Weekly summaries?
