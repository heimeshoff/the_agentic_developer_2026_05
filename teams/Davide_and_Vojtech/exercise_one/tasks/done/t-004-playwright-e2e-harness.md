---
id: t-004
title: Playwright e2e harness
status: done
type: scaffold
created: 2026-05-26
completed: 2026-05-26
commit:
depends_on: [t-001]
files:
  - apps/web/playwright.config.ts
  - apps/web/e2e/**
  - apps/web/package.json
tags: [scaffold, e2e, web]
---

## Why
UI tasks are only "done" when demonstrated in a real browser with no console errors.
That needs a Playwright harness wired to the web dev server. Standing it up early means
every UI task has a path to its browser-level verification.

## What
- Add Playwright to `apps/web`, configured to start/await the Vite dev server.
- A `test:e2e` script.
- A smoke spec that loads the app shell, asserts a known element renders, and asserts no
  console errors were emitted during load.

## Acceptance criteria
- [ ] `pnpm --filter web test:e2e` runs and the smoke spec passes against the dev server.
- [ ] The smoke spec fails if the page emits a console error (the no-console-errors
      assertion is real, not a stub).
- [ ] Config is reusable: a new spec file under `apps/web/e2e/` is picked up without
      extra wiring.

## Notes
Every UI task (e.g. t-008) lists this task in `depends_on`. Keep the smoke spec minimal —
income-specific specs are added by the UI task that needs them.
