# TASK-004: UI Foundation - Layout and Routing

## Metadata
- **Track**: Foundation
- **Priority**: P1 (High - enables UI work)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-001
- **Blocks**: TASK-009, TASK-010, TASK-011, TASK-012, TASK-013
- **Status**: Blocked by TASK-001

## Objective
Create the application shell: routing structure, navigation, and responsive layout. This provides the skeleton for all UI screens.

## Acceptance Criteria
- [ ] React Router v6+ installed and configured
- [ ] Main routes defined: `/` (Dashboard), `/transactions`, `/budget`, `/accounts`, `/settings`
- [ ] Navigation component with links to all routes
- [ ] Responsive layout with sidebar (desktop) or bottom nav (mobile)
- [ ] 404 Not Found page
- [ ] Loading spinner component (reusable)
- [ ] Error boundary component for crash recovery
- [ ] All routes render placeholder pages with headings

## Technical Notes
- Use `react-router-dom` v6 with `createBrowserRouter` or `<BrowserRouter>`
- Consider CSS solution: Tailwind CSS (fast), CSS Modules, or styled-components
- Mobile-first responsive design (320px → 1920px)
- Use semantic HTML: `<nav>`, `<main>`, `<aside>`
- Lazy load routes if bundle size becomes a concern (optional)

## Implementation Hints
```typescript
// Example route structure
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
```

Recommended breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Risks & Considerations
- **Low risk**: Standard React Router setup
- Choose CSS approach early (changing later is tedious)
- Accessibility: keyboard navigation, ARIA labels, focus management
- Consider dark mode support (add CSS variables, toggle in settings)

## Definition of Done
- All routes accessible via navigation
- Layout responsive across mobile/tablet/desktop
- No console errors or warnings
- Navigation highlights active route
- Error boundary catches and displays errors gracefully
- Commit message: "feat: add routing, navigation, and responsive layout"
