---
name: process-backlog
description: Fetch ALL pending [Feature] Asana tasks and drive them through implementation with maximum safe parallelism. Use this when the user wants to drain the entire feature backlog in one command rather than processing tasks one at a time. Triggers on "process the backlog", "drain the backlog", "build everything in Asana", or explicit /process-backlog invocation.
---

# Process Backlog

Run the `process-backlog` workflow to fetch every pending `[Feature]` Asana task and implement them all automatically.

## What this does

1. **Fetch** — One agent retrieves all incomplete `[Feature]` tasks from Asana in one call.
2. **Prepare (parallel)** — All tasks are parsed and receive an in-progress comment simultaneously.
3. **Build (sequential)** — Each feature is implemented by the `feature-builder` agent one at a time. Sequential order prevents conflicts in `App.jsx`, which every feature wires into.
4. **Update Asana** — Each task is marked complete (or left incomplete on failure) automatically.
5. **Report** — A consolidated summary lists what was built, what failed, and what was skipped.

## Human checkpoints

This skill is fully automated. The only human touchpoints are:

- **Before:** drop ideas into Asana and move approved cards to the right section.
- **After:** review the completion report and verify the result in the browser.

Everything between those two moments is handled by the workflow.

## When to use

- After a scout cycle has queued several features and you want to build them all.
- At the start of a session to drain an accumulated backlog.
- Any time a user says: "process all tasks", "drain the backlog", "build everything in Asana".

For a **single specific task**, use the `task-worker` agent instead.

## Usage

Simply say: "Process the backlog" or invoke `/process-backlog` directly. No arguments needed — the workflow discovers all pending tasks automatically via Asana search.

## Output format

```
────────────────────────────────────────────────────────────
process-backlog complete
────────────────────────────────────────────────────────────
Tasks found:   4
Built:         3
Failed:        1
Skipped:       0

Built successfully:
  ✅ [Feature] Savings Goal Tracker
     Build: pass | Tests: pass
     Added GoalCard, GoalList components and goals state in App.jsx.

  ✅ [Feature] Monthly Expense Log
     Build: pass | Tests: pass
     Added ExpenseList, ExpenseForm and expenses state in App.jsx.

Failed (left in backlog):
  ❌ [Feature] Investment Chart (https://app.asana.com/...)
     Build failed: LineChart import not resolved. Check the dependency.
────────────────────────────────────────────────────────────
```

Failed and skipped tasks remain incomplete in Asana for fixing and re-queuing.

## Invoke the workflow

Trigger via the Workflow tool using the saved workflow name `process-backlog`.
