---
name: qa-skill
description: >-
  Run code QA and review the budget app before a commit, PR, or sign-off.
  Use to lint, typecheck, build, run all quality gates at once, audit a diff,
  or check money-handling correctness for team michele-luca's Exercise One
  (React 19 + TypeScript + Vite). Verbs: qa, review, check, lint, typecheck,
  build, audit, gate.
---

# QA & review — budget app (Exercise One)

Static-quality gate runner and review checklist for team michele-luca's
budgeting app. Three gates — **lint → typecheck → build** — wrapped in one
driver that gives a single pass/fail verdict. There is no unit-test runner
installed yet (no `test` script, no vitest), so "QA" here means exactly those
three gates plus a human/agent review pass against the checklist below.

This is the **review** companion to the `dev-budget-app` skill (which *drives
the running app* via Playwright to verify behaviour). Use this one to gate code
quality; use `dev-budget-app` to confirm a feature actually renders/works.

All paths below are relative to the exercise folder
`teams/michele-luca/excercise_one/`. Run everything from there.

## Prerequisites

Deps are already installed (`node_modules/` present, Node 24 / npm 11). If
starting from a clean checkout:

```bash
npm install
```

No OS packages needed — the gates are pure Node tooling (eslint, tsc, vite).

## Run all gates (agent path — start here)

One command, runs all three gates, prints a summary, exits non-zero if any
fail. This is the pre-commit / pre-PR check:

```bash
node .claude/skills/qa-budget-app/qa.mjs
```

Run a single gate when iterating:

```bash
node .claude/skills/qa-budget-app/qa.mjs lint        # eslint .
node .claude/skills/qa-budget-app/qa.mjs types       # tsc -b --force
node .claude/skills/qa-budget-app/qa.mjs build        # vite build
node .claude/skills/qa-budget-app/qa.mjs lint --fix  # auto-fix lint, then report
```

A green run ends with `✓ all 3 gate(s) passed.` and exit 0. A failure prints
the offending eslint/tsc output inline, marks `✗ FAIL` in the summary, and
exits 1 — so it drops straight into a hook or CI step.

## Run the gates individually (human path)

The driver just wraps these npm/npx invocations — use them directly if you
prefer:

```bash
npm run lint          # eslint .
npx tsc -b --force    # full typecheck (see gotcha: plain `tsc -b` lies)
npm run build         # tsc -b && vite build  (the project's real build)
```

`npm run build` already chains typecheck **then** bundle, so it is itself a
two-gate check — but it stops at the first failure and doesn't run eslint.
The driver runs all three regardless so you see every problem in one pass.

## Review checklist (the part tooling can't catch)

Lint and tsc verify syntax and types; they say nothing about *money
correctness*, which is where a budgeting app actually breaks. When reviewing a
diff, check these invariants (from the project's `CLAUDE.md` architecture):

- **Money is integer minor units (cents), never floats.** Reject any
  `amount * 0.01`, `parseFloat` on money, or `number` fields that store euros.
  Amounts are integers; convert/format to a display string only at the UI
  edge. A `0.1 + 0.2 !== 0.3` bug in a budget app is a real defect, not a nit.
- **Arithmetic stays in integer space.** Sums, budget remainders, and
  savings-goal progress add/subtract cents. Division (e.g. splitting) must
  decide rounding explicitly and not drop remainder cents.
- **All persistence goes through the storage layer** (the planned
  `src/lib/storage.ts`). No component should call `localStorage` directly —
  that's the seam that lets the app swap to a real backend later. Flag direct
  `localStorage.getItem/setItem` in components.
- **Domain types are defined and used** (`src/types/`: `Account`, `Income`,
  `Transaction`, `Budget`/`Category`, `SavingsGoal`, `Investment`). Flag
  `any`, untyped JSON from storage, and inline object shapes that should be a
  named domain type.
- **Dates and categories are consistent** — transactions carry a date and a
  category that resolves to a real `Category`; budgets are per-category +
  period. Watch for timezone-sensitive `new Date(string)` parsing.
- **React 19 hooks rules** — the eslint config enforces `react-hooks` and
  `react-refresh`, so violations fail the lint gate; still eyeball effect
  dependency arrays and state updates derived from previous state.

After the static gates pass, if the change is user-visible, hand off to
`dev-budget-app` to screenshot the running result — gates green ≠ feature
works.

## Gotchas (battle scars from building this skill)

- **`vite build` does NOT typecheck — it will happily bundle type-broken
  code.** Proven: injecting `const broken: number = "not a number"` left
  `vite build` reporting success while `tsc` flagged TS2322. esbuild strips
  types without checking them. *Never* treat a green `vite build` as a
  typecheck. This is the whole reason the `types` gate (and `npm run build`'s
  `tsc -b &&` prefix) exists — and why the driver runs tsc as its own gate.
- **`tsc -b` is incremental and silently lies on re-runs.** A second
  `tsc -b` with no source changes prints nothing and exits 0 *without
  re-checking*. The driver uses `tsc -b --force` so every QA run is a real,
  full typecheck. If you run tsc by hand for a gate, add `--force`.
- **`tsconfig` does NOT enable `strict`.** Despite `CLAUDE.md` stating
  "TypeScript (strict mode)", no `strict` key exists in `tsconfig.json`,
  `tsconfig.app.json`, or `tsconfig.node.json` (verified with grep). What *is*
  on: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
  So `null`/`undefined` are not strictly checked — do not assume
  `strictNullChecks` has your back in review. (Worth fixing by adding
  `"strict": true` to `tsconfig.app.json`, but that's a code change, not a QA
  step — don't do it silently as part of a review.)
- **Harmless `DEP0190` deprecation warning** prints at the end of a driver run
  on Windows ("Passing args to a child process with shell option true…"). The
  driver needs `shell: true` to invoke `npx.cmd` on Windows; the args are
  static literals (no injection surface), so the warning is cosmetic. Ignore
  it — the exit code is authoritative.

## Troubleshooting

- **`'eslint'/'tsc'/'vite' is not recognized`** → deps aren't installed. Run
  `npm install` from the exercise folder first.
- **`types` gate "passes" suspiciously fast with no output after you changed
  code** → you're somehow running plain `tsc -b` (incremental). The driver
  uses `--force`; if checking by hand, use `npx tsc -b --force`.
- **Driver exits 2 with "Unknown gate"** → typo in the gate name. Valid:
  `all` (default), `lint`, `types`, `build`, optionally `--fix`.
