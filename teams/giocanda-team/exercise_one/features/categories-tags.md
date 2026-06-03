# Categories & Tags Feature Specification

## 1. Feature Overview

- **Feature Name:** Categories & Tags
- **Category:** Organization & Classification
- **Priority:** Critical (Foundation - required for meaningful financial tracking)
- **One-Sentence Description:** Organize income, expenses, and transactions with customizable categories and tags to enable meaningful analysis and reporting.

## 2. Business Value

### What problem does this solve?
- Unorganized transactions provide no actionable insights
- Users need to understand spending patterns by category
- Budgeting impossible without meaningful categorization
- Tax preparation requires organized expense classification

### Who benefits?
- All users tracking finances
- Budget-conscious individuals
- Tax filers needing organized deductions
- Users wanting spending insights
- Anyone seeking to optimize finances

### Workflow Integration
- Foundation for budget allocation
- Enables spending analysis and reports
- Supports tax categorization
- Critical for financial insights
- Powers search and filtering

## 3. Detailed Requirements

### Functional Requirements

1. **Category Management**
   - Create custom categories
   - Edit category name, icon, color
   - Delete unused categories
   - Merge categories
   - System default categories (undeletable)

2. **Category Hierarchy**
   - Parent/child category relationships
   - Multi-level nesting (e.g., Food > Restaurants > Fast Food)
   - Category inheritance rules

3. **Tag Management**
   - Create free-form tags
   - Tag suggestions based on history
   - Tag auto-completion
   - Bulk tag application
   - Tag merging and deletion

4. **Transaction Assignment**
   - Assign category to transaction
   - Add multiple tags to transaction
   - Bulk categorization
   - Auto-categorization rules
   - Recategorization with history

5. **Category Budgeting**
   - Set default budget per category
   - Category spending limits
   - Category-level analytics

6. **Smart Categorization**
   - Merchant-based auto-assignment
   - Pattern learning from user behavior
   - Suggested categories for new transactions
   - Rules engine for automatic categorization

### Category Types

**Income Categories:** Salary, Freelance, Investment Income, Rental Income, Gifts, Other  
**Expense Categories:** Housing, Transportation, Food, Healthcare, Entertainment, Shopping, Utilities, Insurance, Debt, Savings, Other  
**Hierarchical Example:** Transportation > Fuel, Transportation > Parking, Transportation > Public Transit  

### Non-Functional Requirements

**Performance:** Load category list in under 100ms  
**Usability:** Assign category in under 3 clicks  
**Accuracy:** Auto-categorization >80% accuracy after 100 transactions  

### Business Rules

- Category name must be unique within user's categories
- Cannot delete system default categories
- Cannot delete categories with active transactions (archive instead)
- Hierarchical depth limited to 3 levels
- Tags case-insensitive and normalized
- Merged categories update all historical transactions

## 4. User Stories

### Story 1: Create Custom Category
**As a** user with specific spending needs  
**I want** to create custom expense categories  
**So that** I can track spending meaningful to my situation

**Acceptance Criteria:**
- User can create new category with name
- User can choose icon and color
- User can set parent category (optional)
- Category appears immediately in category list
- Category available for transaction assignment

### Story 2: Auto-Categorize Transactions
**As a** user entering many transactions  
**I want** transactions to be automatically categorized  
**So that** I don't have to manually categorize each one

**Acceptance Criteria:**
- System learns from user's historical categorizations
- Matching transactions auto-assigned category
- User can accept or override suggestion
- Confidence score shown for suggestions
- User can create rules for specific merchants

### Story 3: Organize with Tags
**As a** user tracking multiple projects  
**I want** to tag expenses with project names  
**So that** I can report on per-project spending

**Acceptance Criteria:**
- User can add multiple tags to transaction
- Tag auto-complete suggests existing tags
- User can create new tags on-the-fly
- User can filter transactions by tag
- User can generate reports by tag

## 5. Data Model

```
Category {
  id: UUID
  user_id: UUID (nullable - null for system categories)
  name: String(50)
  category_type: Enum(INCOME, EXPENSE, TRANSFER)
  parent_category_id: UUID (nullable, FK to Category)
  icon: String(50)
  color: String(7) (hex color)
  is_system: Boolean
  default_budget_amount: Decimal(10, 2) (nullable)
  sort_order: Integer
  is_active: Boolean
  created_at: DateTime
  updated_at: DateTime
}

Tag {
  id: UUID
  user_id: UUID
  name: String(50)
  normalized_name: String(50) (lowercase, no spaces)
  color: String(7) (nullable)
  usage_count: Integer (denormalized)
  created_at: DateTime
}

TransactionTag {
  transaction_id: UUID (FK to Transaction)
  tag_id: UUID (FK to Tag)
  created_at: DateTime
}

CategorizationRule {
  id: UUID
  user_id: UUID
  name: String(100)
  match_field: Enum(DESCRIPTION, MERCHANT, AMOUNT_RANGE)
  match_pattern: String(255)
  category_id: UUID (FK to Category)
  confidence: Decimal(3, 2) (0.00-1.00)
  priority: Integer
  is_active: Boolean
  usage_count: Integer
  created_at: DateTime
  updated_at: DateTime
}
```

## 6. User Interface Considerations

**Category List:** Hierarchical tree view, icons, colors, transaction counts  
**Category Selector:** Dropdown with search, icons, hierarchy display, "Create New" option  
**Tag Input:** Chip-style input with auto-complete, create-on-enter  
**Category Settings:** Edit categories, merge, set budgets, view usage  
**Rule Management:** List of auto-categorization rules, enable/disable, priority ordering  

**Mobile:** Icon-based category selection, tag suggestions, swipe to recategorize  
**Desktop:** Advanced category management, rule builder, bulk operations  

## 7. Accessibility Requirements (WCAG 2.1 AA)

- Screen reader announces category name and icon description
- Category colors meet contrast requirements
- Keyboard navigation for category selection
- Tag chips keyboard accessible (delete with backspace)
- Focus indicators on all interactive elements
- Category icons have text alternatives

## 8. Technical Considerations

**API Endpoints:**  
GET /api/categories, POST /api/categories, PUT /api/categories/{id}  
DELETE /api/categories/{id}, POST /api/categories/merge  
GET /api/tags, POST /api/tags  
POST /api/transactions/{id}/categorize, POST /api/transactions/bulk-categorize  
GET /api/categorization-rules, POST /api/categorization-rules  

**Performance:**  
- Cache category tree structure
- Index on user_id, category_type, is_active
- Full-text index on tag names
- Denormalize category usage counts

**Machine Learning (Future):**  
- Train categorization model on user's historical data
- Use merchant name, description, amount as features
- Confidence scoring for suggestions
- Continuous learning from user corrections

**Security:**  
- User can only access own categories and tags
- System categories read-only
- Validate category relationships prevent circular hierarchies

## 9. Testing Strategy

**Unit Tests:** Category hierarchy validation, tag normalization, rule matching logic  
**Integration Tests:** CRUD operations, merge operations, bulk categorization  
**Accessibility:** Keyboard navigation, screen reader compatibility  
**Manual Tests:** Create categories, assign to transactions, test auto-categorization  

## 10. Dependencies

**Must Exist First:**  
- User Authentication (user-specific categories)

**Depends on This:**  
- Income Tracking (uses income categories)
- Expense Tracking (uses expense categories)
- Budgeting (budget by category)
- Financial Reports (analyze by category)
- Transaction History (filter/group by category)

## 11. Open Questions

1. Support for shared categories across household users?
2. Category templates (import standard category sets)?
3. Category merge history and rollback?
4. Tag hierarchies or just flat structure?
5. AI-powered category suggestions for new users?
6. Category usage analytics (identify unused categories)?
7. Import categories from other financial apps?
8. Multi-language category names?
9. Category-specific notes or guidelines?
10. Visual category grouping in reports and charts?
