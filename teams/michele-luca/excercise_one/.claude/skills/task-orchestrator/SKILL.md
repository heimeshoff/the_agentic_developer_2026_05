---
name: task-orchestrator
description: >-
  Pick a task from docs/backlog, implement it using dev-skill, and verify
  with a QA subagent. Use when you want to autonomously complete a backlog
  task end-to-end for team michele-luca's Exercise One.
---

# task-orchestrator

Autonomous task-completion agent for team michele-luca's budgeting app. Reads a
pending task from `docs/backlog/`, implements it via `dev-skill`, then spawns a
QA subagent with `qa-skill` to verify the result.

## When to use this skill

- User says "pick a task and implement it"
- User wants end-to-end automation: read → code → verify
- User wants to delegate the full dev cycle to Claude

## How it works

1. **Read task:** Scan `teams/michele-luca/excercise_one/docs/backlog/` for pending
   tasks. Pick one (or the user specifies which). Task files should be markdown
   with frontmatter containing at least `status: pending` or similar.

2. **Implement:** Use the `dev-skill` skill to write code, start the dev server,
   drive the app with Playwright, and screenshot the result. Follow the domain
   model and architecture in `CLAUDE.md`.

3. **QA handoff:** Spawn an Agent with subagent_type `qa-agent` (or similar) that
   invokes the `qa-skill` skill. The QA agent runs all gates (lint, typecheck,
   build), reviews the diff against the checklist, and reports pass/fail.

4. **Update task:** If QA passes, mark the task completed (e.g., update
   frontmatter to `status: completed` and add a completion timestamp). If QA
   fails, report the issue and optionally iterate.

## Prerequisites

- Tasks must exist in `docs/backlog/` as markdown files with frontmatter
  (`status`, `title`, etc.).
- `dev-skill` and `qa-skill` must be available (they are).
- Node 24, npm 11, and deps installed (`npm install` from
  `teams/michele-luca/excercise_one/`).

## Usage

```bash
# From Claude Code CLI or chat:
/task-orchestrator
# or with a specific task file:
/task-orchestrator task-001-add-transaction-form.md
```

The skill is designed to be invoked by Claude Code's Skill tool — it does not
run as a standalone script.

## Task file format (expected)

```markdown
---
id: task-001
title: Add transaction input form
status: pending
priority: high
created: 2026-05-26
---

# Task: Add transaction input form

Allow users to input a new transaction (amount, category, date). Store in
localStorage via the storage layer. Display in a transaction list below the form.

## Acceptance criteria

- Form has fields: amount (cents), category, date
- Submit button adds transaction to storage
- Transaction list re-renders showing the new entry
- Type-safe: Transaction type from src/types/
```

The orchestrator reads the task description, implements it, and updates the
frontmatter `status` field when done.

## QA subagent

The orchestrator spawns an Agent with a prompt like:

> Run QA on the current diff for task-001. Use the qa-skill to run lint,
> typecheck, and build. Review the diff against the money-correctness checklist
> (integer cents, no floats, storage layer abstraction). Report pass/fail.

The subagent has access to `qa-skill` and reports back. If it fails, the
orchestrator decides whether to fix and retry or escalate to the user.

## Gotchas

- **Tasks must be well-scoped.** A vague task ("improve the UI") will produce
  vague code. The skill works best with concrete acceptance criteria.
- **No commit by default.** The orchestrator implements and verifies but does
  NOT commit unless explicitly told to. You can extend it to auto-commit green
  QA runs if desired.
- **Dev server lifecycle.** The `dev-skill` starts the server in the background
  (`npm run dev &`). The orchestrator should ensure it's running before
  implementing and optionally kill it after QA (or leave it running for the
  next task).
- **Task status tracking.** This skill assumes tasks have a `status` field in
  frontmatter. If your tasks use a different tracking system (e.g., GitHub
  issues, Linear), adapt the read/update logic.

## Extension ideas

- Auto-commit + push when QA passes
- Slack/webhook notification on completion
- Multi-task mode: process all pending tasks in priority order
- Fallback to user on QA failure after N retries
