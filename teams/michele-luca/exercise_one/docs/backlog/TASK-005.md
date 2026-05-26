# TASK-005: Local Storage Adapter

## Metadata
- **Track**: Storage
- **Priority**: P0 (Critical - enables persistence)
- **Estimate**: 3-4 hours
- **Dependencies**: TASK-002
- **Blocks**: TASK-006, TASK-009, TASK-010, TASK-011
- **Status**: Blocked by TASK-002

## Objective
Implement a localStorage-based persistence layer with a repository pattern. This provides CRUD operations for Accounts, Categories, Transactions, and Budget data, with graceful fallback if localStorage is unavailable.

## Acceptance Criteria
- [ ] `StorageAdapter` interface defined with methods: `save`, `load`, `delete`, `list`
- [ ] `LocalStorageAdapter` implementation with JSON serialization/deserialization
- [ ] Separate storage keys for each entity type (`accounts`, `categories`, `transactions`, `budgets`)
- [ ] Error handling for quota exceeded, parse errors, and unavailable localStorage
- [ ] Migration utility for schema changes (version field in stored data)
- [ ] Unit tests for save/load/delete operations
- [ ] Mock storage adapter for testing (in-memory fallback)

## Technical Notes
- Namespace storage keys: `budgetapp:accounts`, `budgetapp:categories`, etc.
- Store version number with data: `{ version: 1, data: [...] }`
- Handle JSON serialization of Date objects (use ISO strings)
- Consider compression for large datasets (optional: `lz-string` library)
- Implement optimistic locking or timestamp-based conflict detection (if time permits)

## Implementation Hints
```typescript
interface StorageAdapter<T> {
  save(id: string, item: T): Promise<void>;
  load(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
  list(): Promise<T[]>;
}

class LocalStorageAdapter<T> implements StorageAdapter<T> {
  constructor(private readonly namespace: string) {}
  
  async save(id: string, item: T): Promise<void> {
    const key = `${this.namespace}:${id}`;
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw e;
    }
  }
  
  // ... other methods
}
```

## Risks & Considerations
- **Medium risk**: Data loss if localStorage is cleared
- localStorage limit: ~5-10MB depending on browser
- No atomic transactions: wrap related saves in try/catch and rollback on error
- Privacy mode / incognito: localStorage may be disabled or ephemeral
- Export/import functionality (TASK-015) will mitigate data loss risk

## Definition of Done
- All CRUD operations work and persist across page reloads
- Error handling tested (quota exceeded, parse errors)
- Unit tests cover success and error cases
- Documentation includes storage key schema and version strategy
- Commit message: "feat: implement localStorage adapter with repository pattern"
