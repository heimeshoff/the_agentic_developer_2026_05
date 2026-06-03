# TASK-014: Settings and Configuration UI

## Metadata
- **Track**: UI
- **Priority**: P2 (Medium - quality-of-life)
- **Estimate**: 2-3 hours
- **Dependencies**: TASK-004
- **Blocks**: None
- **Status**: Blocked by TASK-004

## Objective
Build the Settings page with user preferences: default currency, date format, theme (light/dark), and data management options (load sample data, clear all data, export, import). This is the catch-all for non-core features.

## Acceptance Criteria
- [ ] Currency selector: dropdown with common currencies (USD, EUR, GBP, etc.)
- [ ] Date format selector: MM/DD/YYYY vs DD/MM/YYYY vs YYYY-MM-DD
- [ ] Theme toggle: light mode, dark mode, system preference
- [ ] "Load Sample Data" button (from TASK-006)
- [ ] "Clear All Data" button with confirmation (from TASK-006)
- [ ] "Export Data" button (from TASK-015, if implemented)
- [ ] "Import Data" button (from TASK-015, if implemented)
- [ ] Settings persist in localStorage
- [ ] Changes take effect immediately (no page reload required)

## Technical Notes
- Store settings in localStorage under `budgetapp:settings` key
- Theme: use CSS variables and toggle a class on `<html>` or `<body>` element
- Date format: use `Intl.DateTimeFormat` with locale option, or `date-fns` with format string
- Currency: store as ISO code, use in all Money displays
- Consider adding: start of week (Sunday/Monday), budget period (monthly/bi-weekly)

## Implementation Hints
```typescript
interface AppSettings {
  currency: string; // ISO 4217 code
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  theme: 'light' | 'dark' | 'system';
}

// Example theme toggle
function applyTheme(theme: AppSettings['theme']) {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  } else {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
```

Dark mode CSS:
```css
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}
```

## Risks & Considerations
- **Low risk**: Isolated feature
- Theme: ensure all colors are defined as CSS variables for easy dark mode support
- Accessibility: maintain WCAG AA contrast ratios in both themes
- Settings migration: if settings schema changes, handle gracefully (fallback to defaults)

## Definition of Done
- All settings work and persist
- Theme toggle applies immediately
- Currency and date format reflected throughout app
- Data management buttons functional
- Settings UI responsive
- Commit message: "feat: add settings page with theme, currency, and data management"
