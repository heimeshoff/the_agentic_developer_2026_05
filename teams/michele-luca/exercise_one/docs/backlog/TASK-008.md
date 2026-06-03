# TASK-008: State Management and Data Hooks

## Metadata
- **Track**: Domain Logic
- **Priority**: P0 (Critical - enables UI integration)
- **Estimate**: 3-4 hours
- **Dependencies**: TASK-002, TASK-007
- **Blocks**: TASK-009, TASK-010, TASK-011, TASK-012, TASK-013
- **Status**: Blocked by TASK-002, TASK-007

## Objective
Implement React state management for domain entities using Context API or a lightweight state library (Zustand, Jotai). Provide custom hooks for loading, saving, and querying data, with automatic recalculation of budget summaries.

## Acceptance Criteria
- [ ] `useAccounts()` hook provides list, add, update, delete operations
- [ ] `useCategories()` hook provides list, add, update, delete operations
- [ ] `useTransactions()` hook provides list, add, update, delete, filter operations
- [ ] `useBudget(month)` hook provides budget summary with calculated totals
- [ ] State persists to localStorage automatically (via adapter from TASK-005)
- [ ] Optimistic updates: UI reflects changes immediately, rollback on error
- [ ] Loading and error states exposed by hooks
- [ ] Data refetches on mount and after mutations

## Technical Notes
- Choose state solution: Context + useReducer (built-in), or Zustand (minimal), or Jotai (atomic)
- Wrap storage adapter calls in hooks with `useEffect` and `useState`
- Consider React Query or SWR for caching and refetching (optional, may be overkill)
- Invalidate derived state (budget summaries) when transactions or categories change
- Use `useMemo` to memoize expensive calculations (budget engine)

## Implementation Hints
```typescript
// Example with Context API
interface BudgetContextValue {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // ... more operations
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget must be within BudgetProvider');
  return context;
}

// Example with Zustand
import create from 'zustand';

const useBudgetStore = create<BudgetState>((set) => ({
  accounts: [],
  transactions: [],
  addTransaction: async (tx) => {
    await storage.save('transactions', tx.id, tx);
    set((state) => ({ transactions: [...state.transactions, tx] }));
  },
  // ... more operations
}));
```

## Risks & Considerations
- **Medium risk**: State management can become complex
- Overfetching: load all data upfront (OK for MVP) vs. lazy load by month/category
- Performance: recalculating budget on every transaction may be slow for large datasets (optimize later)
- Concurrency: multiple tabs editing same data (out of scope for MVP, flag as future work)

## Definition of Done
- All hooks work in UI components (tested in at least one screen)
- Data persists and reloads correctly across page refreshes
- No unnecessary re-renders (verified with React DevTools Profiler)
- Error handling: display error messages in UI (toast or inline)
- Commit message: "feat: implement state management and data hooks with persistence"
