---
name: test
description: Write and run tests for code in this project. Use this skill whenever new code has been written or modified, or when the user asks to test, cover, or verify a piece of functionality. The developer agent should invoke this skill automatically after completing any non-trivial implementation.
---

# Test

Write and run tests for the personal finance app using **Vitest** (the natural pairing for Vite) and **React Testing Library** for component tests.

## Step 1 — detect existing test setup

Check whether Vitest is already configured:
- Look for `vitest` in `package.json` devDependencies
- Look for a `test` script in `package.json`
- Look for `vitest.config.*` or a `test` block inside `vite.config.js`
- Look for existing test files (`*.test.js`, `*.test.jsx`, `*.spec.js`)

Run all checks in parallel.

## Step 2 — set up Vitest if not present

If Vitest is not yet installed, install the minimum required packages and wire up the config. Do this in one pass:

```bash
cd teams/tom_artem/exercise_one && npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
```

Then add the following to `vite.config.js` inside `defineConfig`:

```js
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.js'],
  globals: true,
},
```

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom'
```

Add scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

State what was installed and why, then continue to writing tests.

## Step 3 — identify what to test

Determine the target scope from context:
- If called after a specific implementation, test that code.
- If the user names a file or feature, target that.
- Never attempt to cover the entire codebase in one pass — focus on what changed.

Read the target file(s) before writing a single test.

## Step 4 — write tests

### Utility functions (`src/utils/`)
Place tests alongside the source as `*.test.js`. Cover:
- Happy path with representative inputs
- Boundary conditions (zero, negative, very large numbers, missing arguments)
- All branches in the function logic

Example skeleton for `apportion.js`:

```js
import { describe, it, expect } from 'vitest'
import { apportion, formatCurrency, DEFAULT_SPLITS } from './apportion'

describe('apportion', () => {
  it('splits salary using default 50/30/20 rule', () => { ... })
  it('returns zero amounts for zero salary', () => { ... })
  it('respects custom splits', () => { ... })
  it('amounts sum to the input salary', () => { ... })
})
```

### React components (`src/components/`)
Place tests alongside the component as `*.test.jsx`. Use React Testing Library — query by role, label, or visible text; never by CSS class or internal implementation details. Cover:
- What the component renders given its props
- User interactions (typing, clicking) and resulting UI changes
- Edge states: empty input, invalid values, zero

```js
import { render, screen, fireEvent } from '@testing-library/react'
import SalaryInput from './SalaryInput'

describe('SalaryInput', () => {
  it('renders a labelled salary input', () => { ... })
  it('calls onChange with the new value when the user types', () => { ... })
})
```

### Principles
- One behaviour per test; descriptive names that read as specifications.
- Arrange–Act–Assert, clearly separated.
- No reliance on real time, network, or random state.
- Each test sets up its own state — no shared mutable fixtures.
- Never assert on CSS classes or internal component state — assert on what the user sees.

## Step 5 — run the tests

```bash
cd teams/tom_artem/exercise_one && npm test
```

Report the result:
- If all pass: list the test file(s) and count.
- If any fail: show the failure output verbatim, identify whether the bug is in the test or the production code, and fix it. Do not mask failures with weaker assertions.

## Step 6 — report

Provide a concise summary:
- Files created or modified
- What each test covers in plain English
- Command to run the suite
- Any gaps: untested branches, integration concerns, or testability issues in the production code worth flagging
