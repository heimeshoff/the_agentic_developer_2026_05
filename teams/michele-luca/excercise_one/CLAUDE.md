# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

This file covers **team michele-luca's Exercise One** only. The repo-wide rules
(workshop purpose, `--no-ff` merge policy, where team code lives) are in the root
`CLAUDE.md` two levels up — read that first; this file does not repeat it.

## Project basics

- **Team:** michele-luca
- **Branch:** `team-michele-luca` (all work stays on this branch)
- **This folder:** `teams/michele-luca/excercise_one/` — every file for this exercise lives here, nowhere else
- **Brief:** `instruction.md` — a personal finance / budgeting app (income, budgeting, savings, investments). Loose brief; favour exploration over polish.

## Tech stack (chosen)

- **Language:** TypeScript (strict mode).
- **UI:** React (single-page app, no backend to start).
- **Build/dev tooling:** Vite.
- **Data:** browser `localStorage` initially — local-first, no server. Promote to an API/DB only if the app outgrows it.

Scaffolded with `npm create vite@latest -- --template react-ts` (React 19, Vite 8,
TypeScript 6). `package.json` is the source of truth for versions and scripts.

## Commands

Run from this folder (`teams/michele-luca/excercise_one/`).

- Install deps: `npm install`
- Dev server (hot reload): `npm run dev`
- Production build (type-checks then bundles): `npm run build`
- Preview the build: `npm run preview`
- Lint: `npm run lint`

<!-- Add the single-test command here once a test runner (e.g. Vitest) is set up. -->

## Architecture (planned)

Single-page React app; all state lives client-side. Intended shape:

- **Entry:** `index.html` → `src/main.tsx` mounts the React root → `src/App.tsx`.
- **Domain model** (the core of a budgeting app — define these types first, in `src/types/`):
  - `Account` / `Income` — money coming in.
  - `Transaction` — dated money movements (amount, category, account).
  - `Budget` / `Category` — planned allocation per category and period.
  - `SavingsGoal` — target amount + progress.
  - `Investment` — holdings and value over time.
- **Persistence:** a thin storage layer (e.g. `src/lib/storage.ts`) wrapping
  `localStorage` (de/serialise JSON). Keep all reads/writes behind it so swapping to a
  real backend later touches one file.
- **Money handling:** store amounts as integer minor units (cents) to avoid float
  rounding bugs; format for display at the edges only.
- **UI:** feature components under `src/components/` (e.g. budget overview, transaction
  list, savings/investment views). Charts via a lib chosen when first needed.

<!-- Update this section to match the real code as it lands: actual folders, state
     management choice, and how data flows once components exist. -->
