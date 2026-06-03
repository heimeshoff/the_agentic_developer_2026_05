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
| `feature-builder` | End-to-end feature implementation from a brainstorm decision summary; reads files in parallel; auto-triggers `finance-expert` for financial logic |
| `developer` | Targeted code changes: bug fixes, component edits, refactoring |
| `finance-expert` | Validates financial logic, rules, and calculations — does not write code |
| `task-worker` | Fetches a single Asana task and drives it through implementation |
| `asana-scout` | Two-pass cycle: drafts decision summaries for raw ideas (parallel), queues approved tasks for building (parallel) |

### Skills

| Skill | Purpose |
| --- | --- |
| `/brainstorm` | Structured feature ideation — produces a decision summary |
| `/test` | Writes and runs Vitest tests; invoked automatically by `feature-builder` |
| `/apportion-salary` | Salary split advice; can update `DEFAULT_SPLITS` in `apportion.js` |
| `/process-backlog` | Drain the entire Asana feature backlog in one command — fully automated |

### Automation pipeline

The end-to-end workflow requires human input at three points only:

| Step | Who | Action |
| --- | --- | --- |
| 1 | **Human** | Drop a raw idea into the Asana **Ideas** section |
| 2 | `asana-scout` | Drafts decision summaries and posts them for review (parallel across all ideas) |
| 3 | **Human** | Move the card to **Approved** in Asana |
| 4 | `asana-scout` | Creates `[Feature]` tasks directly in Asana for all approved cards (parallel) |
| 5 | `/process-backlog` | Fetches all queued tasks, builds each via `feature-builder`, updates Asana — fully automated |
| 6 | **Human** | Review the completion report and verify in the browser |

Steps 2, 4, and 5 require no human interaction. Run `asana-scout` on a schedule (or manually) to keep the pipeline moving.

## Development principles

- Favour working software over polish — this is a workshop, not a production app.
- Prefer simple, readable code over clever abstractions.
- When in doubt, do the simplest thing that could work and we'll iterate.
