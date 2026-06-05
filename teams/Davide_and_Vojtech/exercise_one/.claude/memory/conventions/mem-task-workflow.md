---
id: mem-task-workflow
title: Convention — two-terminal task-board workflow
tags: [workflow, tasks, board, brainstorm, work, kanban, backlog, todo, doing, done, commit, branch, depends_on]
scope: convention
---
Work flows through markdown task files in `tasks/`, the shared contract between two terminals
that never talk directly (only files + git):

- **Terminal A → `/brainstorm`**: writes `VISION.md`, drops dependency-linked task files.
- **Terminal B → `/work`**: pulls *ready* tasks from `tasks/todo/`, dispatches ≤2 parallel
  workers, auto-commits one commit per passing task.

Rules:
- **Status = folder**: `backlog/` → `todo/` → `doing/` → `done/`. The folder is authoritative;
  `/work` only ever pulls from `todo/`.
- A task is **ready** when every id in `depends_on` is in `done/`.
- Two ready tasks with overlapping `files` are not dispatched in the same wave (lower id first).
- **IDs are global + monotonic** (`t-001`, `t-002`…); never reuse or renumber. Pick the next id
  by scanning the highest across all four folders.
- **One task = one commit**, tagged `[t-NNN]`. Find it with `git log --grep "\[t-003\]"`.
- We work on the **`Davide_and_Vojtech`** branch; merge to `main` with `--no-ff`. Commit only when asked.
