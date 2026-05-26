# Tom's Team — The Agentic Developer Workshop

## Context

Building a personal finance / budgeting app for Exercise One.
All code lives under `teams/tom/exercise_<n>/`. Always work on the `tom` team branch; never commit directly to `main`.

## Agentic workflow

Four stages. Each has a dedicated agent or skill:

| Stage  | Trigger              | Handled by           |
|--------|----------------------|----------------------|
| Plan   | `/plan <feature>`    | `planner` agent      |
| Code   | Claude directly      | —                    |
| Test   | Automatic after code | `unit-test-writer` agent |
| Review | `/review`            | `code-reviewer` agent |
| Commit | `/commit`            | `git-commit` skill   |

See `workflow.md` for the visual diagram.

## Rules

- Run `/plan` before any non-trivial feature to get a task breakdown first.
- The `unit-test-writer` agent runs proactively after every code change — do not skip it.
- Run `/review` before every commit to catch issues early.
- Tests must pass before committing.
- No code under `instructions/` — that directory is read-only workshop material.

## Stack

No stack prescribed. Detect language and tooling from what already exists in the exercise folder before generating new files. If starting fresh, pick something and state your choice clearly.
