# Budget App Development Backlog

## Overview

This backlog breaks down the budget app implementation into 17 discrete tasks organized across 5 parallel tracks. The structure enables systematic development while allowing team members to work on independent features concurrently after foundational work is complete.

**Total Estimated Effort:** 45-60 hours (MVP scope)

**Development Philosophy:** This is a workshop exercise emphasizing breadth and exploration over production polish. The backlog is intentionally comprehensive to demonstrate domain-driven design and modern React patterns, but teams should prioritize learning and experimentation over feature completion.

---

## Task Summary

### Foundation Track (4 tasks, ~10-13 hours)
Critical infrastructure that blocks all subsequent work. Must be completed first.

- **TASK-001: Project Scaffold and Development Environment** (P0, 2-3h) → BLOCKS: 002, 003, 004
  - Set up React 19 + TypeScript + Vite with tooling
- **TASK-002: Core Domain Model - Foundation Types** (P0, 3-4h) → BLOCKS: 005, 006, 007, 008
  - Define Account, Category, Transaction, Budget, Money types
- **TASK-003: Build and QA Pipeline** (P1, 2-3h) → ENABLES: Quality for all tracks
  - Configure typecheck, lint, format, test scripts
- **TASK-004: UI Foundation - Layout and Routing** (P1, 2-3h) → BLOCKS: 009, 010, 011, 012, 013
  - React Router, navigation, responsive layout

### Storage Track (2 tasks, ~4-6 hours)
Persistence layer enabling data CRUD operations.

- **TASK-005: Local Storage Adapter** (P0, 3-4h) → BLOCKS: 006, 009, 010, 011
  - Repository pattern with localStorage, error handling, migrations
- **TASK-006: Data Seeding and Sample Data** (P1, 1-2h)
  - Realistic seed data for demo and testing

### Domain Logic Track (4 tasks, ~13-16 hours)
Core business logic and state management.

- **TASK-007: Budget Calculation Engine** (P0, 4-5h) → BLOCKS: 008, 011
  - Rollover logic, spent/remaining calculations, overspending detection
- **TASK-008: State Management and Data Hooks** (P0, 3-4h) → BLOCKS: 009, 010, 011, 012, 013
  - React Context/Zustand with custom hooks for all entities
- **TASK-009: Account Management UI** (P1, 2-3h) → BLOCKS: 010
  - CRUD for accounts with validation
- **TASK-010: Transaction Management UI** (P0, 4-5h) → BLOCKS: 011
  - Table with sort/filter, add/edit/delete forms

### UI Track (5 tasks, ~15-19 hours)
User-facing screens and interactions.

- **TASK-011: Budget Planning UI** (P0, 4-5h)
  - Category breakdown, progress bars, rollover toggles, month navigation
- **TASK-012: Dashboard and Summary View** (P0, 3-4h)
  - Landing page with balance, budget health, recent transactions
- **TASK-013: Category Management UI** (P1, 2-3h) → BLOCKS: 011
  - CRUD for categories with icons/colors
- **TASK-014: Settings and Configuration UI** (P2, 2-3h)
  - Currency, date format, theme, data management
- **TASK-015: Data Export and Import** (P2, 2-3h)
  - JSON export/import with validation

### Polish Track (2 tasks, ~3-5 hours)
User experience improvements and documentation.

- **TASK-016: Error Handling and User Feedback** (P2, 2-3h)
  - Toasts, error boundaries, loading states, confirmations
- **TASK-017: Documentation and User Guide** (P3, 1-2h)
  - README, architecture docs, troubleshooting

---

## Critical Path (Sequential, ~20 hours)

These tasks form the longest dependency chain and define minimum time to MVP:

1. **TASK-001: Project Scaffold** (2-3h)
2. **TASK-002: Domain Model** (3-4h)
3. **TASK-005: Storage Adapter** (3-4h)
4. **TASK-008: State Management** (3-4h)
5. **TASK-012: Dashboard** (3-4h)

**Critical Path Total:** ~20 hours (with no parallelization)

---

## Parallel Work Opportunities

After completing Foundation tasks (001-004), multiple tracks can proceed in parallel:

### Wave 1: After TASK-002 (Domain Model)
- **TASK-007: Budget Engine** (Domain Logic)
- **TASK-005: Storage Adapter** (Storage)

### Wave 2: After TASK-005 (Storage) + TASK-008 (State)
- **TASK-009: Account UI** (Domain Logic)
- **TASK-010: Transaction UI** (Domain Logic)
- **TASK-013: Category UI** (UI)
- **TASK-006: Sample Data** (Storage)

### Wave 3: After TASK-007 (Budget Engine) + TASK-008 (State)
- **TASK-011: Budget Planning UI** (UI)
- **TASK-012: Dashboard** (UI)

### Wave 4: Anytime after TASK-004 (Routing)
- **TASK-014: Settings UI** (UI)
- **TASK-016: Error Handling** (Polish)

### Wave 5: Final Polish
- **TASK-015: Export/Import** (Polish)
- **TASK-017: Documentation** (Polish)

**Optimal Team Size:** 2-4 developers (1-2 pairs can work concurrently after foundation)

---

## Priority Breakdown

### P0 (Critical - MVP Blockers): 7 tasks
001, 002, 005, 007, 008, 010, 011, 012

These tasks define the minimum viable product: scaffold, types, storage, budget logic, state, transactions, budget UI, dashboard.

**P0 Estimated Total:** ~28-36 hours

### P1 (High - Important Features): 4 tasks
003, 004, 006, 009, 013

Quality pipeline, routing, sample data, accounts UI, categories UI. Essential for a complete experience but not strictly blocking core functionality.

**P1 Estimated Total:** ~9-13 hours

### P2 (Medium - Quality of Life): 3 tasks
014, 015, 016

Settings, export/import, error handling. Improve UX but can be deferred.

**P2 Estimated Total:** ~6-9 hours

### P3 (Low - Nice to Have): 1 task
017

Documentation. Important for handoff but not feature work.

**P3 Estimated Total:** ~1-2 hours

---

## Risk Assessment

### High Risk Tasks
- **TASK-007: Budget Calculation Engine** - Complex rollover logic with many edge cases
- **TASK-010: Transaction Management UI** - Complex UI with sorting, filtering, and performance concerns
- **TASK-011: Budget Planning UI** - Rollover display and editing requires careful UX design

**Mitigation:** Allocate extra time, write comprehensive tests, iterate on UX after initial implementation.

### Medium Risk Tasks
- **TASK-002: Domain Model** - Changes are expensive later; invest in upfront design
- **TASK-005: Storage Adapter** - Data loss scenarios need careful handling
- **TASK-008: State Management** - Can become complex; keep it simple initially
- **TASK-012: Dashboard** - Multiple data sources; ensure performance

**Mitigation:** Review designs before implementation, add validation and error handling, performance test with realistic data.

### Low Risk Tasks
All others (standard CRUD, tooling, UI patterns)

---

## Technical Decisions Log

### Stack
- **Framework:** React 19 with TypeScript (strict mode)
- **Build Tool:** Vite (fast, modern, good DX)
- **Testing:** Vitest + React Testing Library
- **Routing:** React Router v6
- **Storage:** localStorage (MVP), extensible to backend later
- **State Management:** TBD (Context API, Zustand, or Jotai - decide in TASK-008)
- **Styling:** TBD (Tailwind, CSS Modules, or styled-components - decide in TASK-004)

### Domain Constraints
- **Money:** Store as integer cents to avoid floating-point errors
- **Dates:** ISO 8601 strings (YYYY-MM-DD), stored as UTC
- **Currency:** Single currency for MVP (USD), plan for multi-currency expansion
- **Budget Period:** Monthly (MVP), consider bi-weekly/weekly later
- **Rollover:** Per-category opt-in, carries forward unused budget indefinitely

### Known Limitations (MVP)
- No backend: data is device-local, export/import for backup
- Single user: no auth or multi-user support
- Single currency: no exchange rate handling
- No transaction splits: one category per transaction
- No recurring transactions: manual entry only
- No bank sync: manual data entry
- No reports/charts: basic dashboard only (can add visualizations later)

---

## Measurement Criteria

### Definition of MVP
An app where a user can:
1. Create accounts and track balances
2. Create categories and set monthly budgets
3. Add transactions and categorize them
4. View budget status (spent/remaining) with rollover support
5. See a dashboard summarizing financial health
6. Export/import data for backup

### Success Metrics (Workshop Context)
- **Functionality:** Core P0 tasks (001, 002, 005, 007, 008, 010, 011, 012) completed
- **Quality:** All implemented features pass typecheck, lint, and tests
- **Usability:** App is navigable and understandable without documentation
- **Learning:** Team can articulate design decisions and trade-offs

### Stretch Goals (If Time Permits)
- Charts and visualizations (spending trends, category pie chart)
- Keyboard shortcuts for power users
- Accessibility audit (WCAG AA compliance)
- Performance optimization (virtualized lists for 1000+ transactions)
- PWA features (offline support, install prompt)
- Multi-currency support
- Recurring transaction templates

---

## Development Workflow

### Recommended Approach
1. **Sprint 0 (Foundation):** Complete TASK-001 through TASK-004 sequentially (~10-13h)
2. **Sprint 1 (Core Logic):** Parallel work on TASK-005, TASK-007, TASK-008 (~10-13h)
3. **Sprint 2 (Primary UI):** Parallel work on TASK-009, TASK-010, TASK-011, TASK-012 (~15-19h)
4. **Sprint 3 (Secondary UI):** Complete TASK-013, TASK-014, and polish tasks (~10-13h)

### Pull Request Strategy
- One PR per task (keeps changes focused and reviewable)
- Include task number in branch name: `feature/TASK-001-scaffold`
- Merge to team branch (e.g., `team-michele-luca`) using `--no-ff`
- Update task status in this INDEX.md as tasks complete

### Testing Strategy
- Unit tests for domain logic (TASK-002, TASK-007)
- Integration tests for state management (TASK-008)
- Component tests for UI (TASK-009 through TASK-014)
- E2E tests optional (Playwright) if time permits

---

## Open Questions (To Be Resolved During Implementation)

1. **State Management Library:** Context API (simple) vs Zustand (ergonomic) vs Jotai (atomic)? → Decide in TASK-008
2. **CSS Strategy:** Tailwind (fast) vs CSS Modules (scoped) vs styled-components (dynamic)? → Decide in TASK-004
3. **Rollover Initialization:** How to handle first month with no rollover data? → Default to zero, document in TASK-007
4. **Delete Account with Transactions:** Prevent, cascade delete, or mark inactive? → Decide in TASK-009
5. **Budget Mid-Month Edits:** Should changes apply retroactively or from edit date forward? → Decide in TASK-011 (recommend retroactive for simplicity)
6. **Chart Library:** Recharts (React-native), Chart.js (canvas), or Victory (SVG)? → Decide if charts are added (stretch goal)

---

## Appendix: Task Dependency Graph

```
TASK-001 (Scaffold)
  ├─→ TASK-002 (Domain Model)
  │     ├─→ TASK-005 (Storage Adapter)
  │     │     ├─→ TASK-006 (Sample Data)
  │     │     └─→ TASK-009 (Account UI) ───┐
  │     │           └─→ TASK-010 (Transaction UI) ───┐
  │     └─→ TASK-007 (Budget Engine) ───┐            │
  │           └─→ TASK-008 (State Management) ───────┼───┐
  │                                                   │   │
  ├─→ TASK-003 (QA Pipeline) [parallel, no blockers] │   │
  │                                                   │   │
  └─→ TASK-004 (Routing & Layout)                    │   │
        ├─→ TASK-013 (Category UI) ───────────────────┼───┤
        ├─→ TASK-014 (Settings UI)                   │   │
        └─→ TASK-016 (Error Handling)                │   │
                                                      ↓   ↓
                                    TASK-011 (Budget Planning UI)
                                             ↓
                                    TASK-012 (Dashboard)
                                             ↓
                                    TASK-015 (Export/Import)
                                             ↓
                                    TASK-017 (Documentation)
```

---

## Change Log

- **2026-05-26:** Initial backlog created with 17 tasks across 5 tracks

---

**Next Step:** Begin with TASK-001 (Project Scaffold). Once complete, proceed to TASK-002 (Domain Model) and TASK-003 (QA Pipeline) in parallel.
