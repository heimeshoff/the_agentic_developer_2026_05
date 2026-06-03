# TASK-016: Error Handling and User Feedback

## Metadata
- **Track**: Polish
- **Priority**: P2 (Medium - UX improvement)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-001, TASK-008
- **Blocks**: None
- **Status**: Blocked by TASK-001, TASK-008

## Objective
Implement consistent error handling and user feedback mechanisms throughout the app: toast notifications, error boundaries, loading states, and validation messages. Improve perceived polish and user confidence.

## Acceptance Criteria
- [ ] Toast notification system for success/error/info messages
- [ ] Error boundary catches crashes and displays friendly recovery message
- [ ] Loading spinners or skeleton screens for async operations
- [ ] Form validation errors displayed inline (per field) and as summary
- [ ] Confirmation dialogs for destructive actions (delete account, clear data)
- [ ] Offline detection: warn if localStorage unavailable or quota exceeded
- [ ] Retry mechanism for failed operations (optional)

## Technical Notes
- Toast library: `react-hot-toast`, `react-toastify`, or custom component
- Error boundary: React component with `componentDidCatch` or `ErrorBoundary` from library
- Loading states: use Suspense boundaries or manual `isLoading` flags in hooks
- Validation: use `react-hook-form` error object or custom validation utility
- Confirmation dialogs: native `window.confirm()` (quick) or custom modal (better UX)

## Implementation Hints
```typescript
// Example toast usage
import toast from 'react-hot-toast';

async function saveAccount(account: Account) {
  try {
    await storage.save('accounts', account.id, account);
    toast.success('Account saved successfully');
  } catch (error) {
    toast.error(`Failed to save account: ${error.message}`);
  }
}

// Example error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

## Risks & Considerations
- **Low risk**: Incrementally add to existing features
- Toast overload: limit concurrent toasts (3-5 max), auto-dismiss after 3-5 seconds
- Accessibility: toasts must be announced by screen readers (use `role="status"` or `aria-live`)
- Error messages: user-friendly language, no stack traces (log to console for devs)

## Definition of Done
- Toast notifications appear for save/delete operations
- Error boundary catches and displays errors gracefully
- All forms show validation errors
- Destructive actions require confirmation
- Loading states visible during async operations
- No silent failures (all errors surfaced to user or logged)
- Commit message: "feat: add toast notifications, error boundaries, and loading states"
