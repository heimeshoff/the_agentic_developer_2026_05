---
name: dev-skill
description: >-
  Implement, build, and verify React + TypeScript features for team
  michele-luca's budgeting app (Exercise One). Use when adding a feature,
  writing a component or domain type, running the dev server, type-checking,
  linting, or taking a screenshot to confirm a change renders. Drives the
  running app headlessly via Playwright + Microsoft Edge.
---

# dev-budget-app

Develop and **visually verify** team michele-luca's personal-finance / budgeting
app — a single-page **React 19 + TypeScript 6 + Vite 8** app, local-first
(`localStorage`, no backend). All paths below are relative to the exercise
folder **`teams/michele-luca/excercise_one/`**; run every command from there.

The point of this skill is the feedback loop: write TS/TSX → the app hot-reloads
→ drive it headlessly with `driver.mjs` (Playwright → Edge) to screenshot the
result and read the rendered DOM / `localStorage`. A markdown file can't click a
button; the driver can.

## Prerequisites

- Node 24 + npm 11 (verified with `node v24.13.1`, `npm 11.8.0`).
- **No browser download.** The driver uses `channel: 'msedge'` — the Edge that
  ships with Windows 11. Do **not** run `npx playwright install chromium`.
- `playwright` is already a devDependency; `npm install` pulls it in.

## Setup & build

```bash
npm install          # installs deps incl. playwright
npm run build        # tsc -b (type-check) + vite build — must pass before you commit
npm run lint         # eslint . — must exit 0 (it lints driver.mjs too)
```

## Run + verify a change (agent path — use this)

**1. Start the dev server once and leave it running** (hot reload). Background it
so you keep the shell:

```bash
npm run dev -- --port 5173 --strictPort > /tmp/vite-dev.log 2>&1 &
```

It's ready when `/tmp/vite-dev.log` shows `VITE v8.x ready in NNN ms`. App is at
`http://localhost:5173/`.

**2. After each code change, drive the live page with the driver** (connects to
the running server via `--url`, so it's fast — no respawn):

```bash
# Screenshot the current render -> .claude/skills/dev-budget-app/last-shot.png
node .claude/skills/dev-budget-app/driver.mjs shot --url http://localhost:5173/

# Read rendered DOM / localStorage (the app persists state there)
node .claude/skills/dev-budget-app/driver.mjs eval --url http://localhost:5173/ "({ h1: document.querySelector('h1')?.textContent, lsKeys: Object.keys(localStorage) })"

# Drive a UI flow: click a selector, then screenshot the result
node .claude/skills/dev-budget-app/driver.mjs click --url http://localhost:5173/ "button.counter" --out .claude/skills/dev-budget-app/after-click.png
```

**3. Actually open the screenshot** (Read the PNG). If it's blank or shows
Vite's error overlay, the change is broken — check `/tmp/vite-dev.log` and the
driver's `PAGE CONSOLE ERRORS` output. Screenshots land in the skill dir and are
git-ignored.

**One-shot without a running server:** omit `--url` and the driver spawns Vite
on 5173 itself, screenshots, and kills the whole process tree on exit:

```bash
node .claude/skills/dev-budget-app/driver.mjs shot
```

## Run (human path)

`npm run dev`, open the printed `http://localhost:5173/` in a browser, Ctrl-C to
stop. Fine for eyeballing; the agent path above is what you use to verify
programmatically.

## How to implement features here

Follow the architecture in `CLAUDE.md`. In short:

- **TypeScript strict.** Define domain types first under `src/types/`
  (`Account`/`Income`, `Transaction`, `Budget`/`Category`, `SavingsGoal`,
  `Investment`) before wiring UI.
- **Money = integer minor units (cents).** Store/compute in cents; format to a
  currency string only at the display edge. Never store floats.
- **Persistence behind one module** (e.g. `src/lib/storage.ts`) wrapping
  `localStorage` JSON de/serialise, so swapping to a real backend touches one
  file. Verify writes with the driver's `eval` (`Object.keys(localStorage)`).
- **Feature components** under `src/components/`. Entry chain:
  `index.html` → `src/main.tsx` → `src/App.tsx`.
- Run `npm run build` (type-check) and `npm run lint` before committing; both
  must be clean.

## Gotchas

- **Edge, not Chromium.** Launch is `chromium.launch({ channel: 'msedge' })`.
  Plain `chromium.launch()` fails here — no bundled Chromium is downloaded (by
  design; we use the OS Edge).
- **Orphaned Vite on Windows.** `npm run dev` spawns `vite` as a *grandchild*;
  killing the npm pid alone leaves Vite holding port 5173 → next start fails
  with `Port 5173 is already in use`. The driver's self-spawn path handles this
  with `taskkill /F /T /PID`. If you started Vite yourself and the port sticks,
  free it (see Troubleshooting).
- **`--strictPort` is deliberate.** Without it Vite silently jumps to 5174 when
  5173 is busy, and the driver's `--url` then points at nothing. Keep the port
  fixed at 5173.
- **Run the driver from the exercise folder.** A script outside the project
  (e.g. in `/tmp`) can't resolve `playwright` from `node_modules` —
  `ERR_MODULE_NOT_FOUND`.
- **Ignore the `DEP0190` shell deprecation warning** the self-spawn path prints;
  it's harmless. Filter with `| grep -v -i deprecat` if it's noisy.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Port 5173 is already in use` | An orphaned Vite. PowerShell: `Get-NetTCPConnection -LocalPort 5173 -State Listen \| Select -Expand OwningProcess -Unique \| %{ Stop-Process -Id $_ -Force }` |
| Driver prints `PAGE CONSOLE ERRORS` | Your React/TS code threw at runtime — read the message; the build may type-check but still crash in the browser. |
| `dev server did not become ready in 30s` (self-spawn) | Port conflict or a Vite startup error — check `/tmp/vite-dev.log`. |
| `ERR_MODULE_NOT_FOUND` for `playwright` | You ran the driver from outside the exercise folder. `cd` into `teams/michele-luca/excercise_one/`. |
| Screenshot is blank | Page not loaded yet, or wrong `--url`. Confirm the server is up and the URL matches the printed Local URL. |

## The driver

`.claude/skills/dev-budget-app/driver.mjs` — Playwright + Edge harness.
Commands: `shot` (screenshot), `eval "<js>"` (run JS in page, print JSON),
`click "<selector>"` (click + screenshot). Flags: `--url <U>` (connect to a
running server instead of spawning), `--out <file>`, `--full` (full-page shot).
