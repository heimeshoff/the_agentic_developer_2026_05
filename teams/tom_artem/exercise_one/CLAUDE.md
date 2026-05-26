# CLAUDE.md — Team tom_artem, Exercise One

## Scope

All work for this exercise lives under `teams/tom_artem/exercise_one/`. Do not read or modify files outside this directory unless explicitly asked.

## What we are building

A **personal finance and budgeting application**. The domain includes:

- **Income** — tracking money coming in
- **Budgeting** — planning and categorising spending
- **Savings** — setting money aside toward goals
- **Investments** — tracking money put to work

The brief is intentionally open. Shape the product as we explore.

## Tech stack

- **Language:** JavaScript
- **Runtime:** Node.js
- **Package manager:** npm (default unless we specify otherwise)
- **Frontend framework:** React
- Bundler and other tooling TBD — ask before introducing new dependencies.

## Development workflow

New features follow a two-step pipeline:

1. **`/brainstorm`** — explore the idea, weigh approaches, agree on a direction. Ends with a decision summary (feature name, problem, chosen approach, open questions, first step).
2. **`feature-builder` agent** — takes the decision summary and drives the full implementation: reads existing code, plans a checklist, writes code, runs a build check, invokes `/test`, and returns a completion report for review.

For targeted work that doesn't come from a brainstorm (bug fixes, small component changes, refactoring), use the **`developer` agent** directly.

### Agents

| Agent | Purpose |
| --- | --- |
| `feature-builder` | End-to-end feature implementation from a brainstorm decision summary |
| `developer` | Targeted code changes: bug fixes, component edits, refactoring |
| `finance-expert` | Validates financial logic, rules, and calculations — does not write code |

### Skills

| Skill | Purpose |
| --- | --- |
| `/brainstorm` | Structured feature ideation — produces a decision summary |
| `/test` | Writes and runs Vitest tests; invoked automatically by `feature-builder` |
| `/apportion-salary` | Salary split advice; can update `DEFAULT_SPLITS` in `apportion.js` |

## Development principles

- Favour working software over polish — this is a workshop, not a production app.
- Prefer simple, readable code over clever abstractions.
- When in doubt, do the simplest thing that could work and we'll iterate.
