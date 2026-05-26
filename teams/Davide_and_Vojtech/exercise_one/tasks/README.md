# Task board

This directory is the **shared contract** between the two terminals:

- Terminal A runs `/brainstorm` — writes `VISION.md` and drops task files here.
- Terminal B runs `/work` — picks ready tasks, implements them, commits.

They never talk directly. The only link is these files + git.

## Status = folder

A task's status is **which folder it lives in**. The `status:` frontmatter field
mirrors the folder; the folder is authoritative.

| Folder      | Meaning                                                                 | Who moves it here |
| ----------- | ----------------------------------------------------------------------- | ----------------- |
| `backlog/`  | Captured but not ready to work — too vague, unscoped, or unresolved deps | `/brainstorm`     |
| `todo/`     | Ready to work — clear acceptance criteria, deps known                    | `/brainstorm`, you (promote) |
| `doing/`    | Claimed by a worker right now                                            | `/work`           |
| `done/`     | Acceptance criteria met and committed                                    | worker → `/work` commits |

`/work` only ever pulls from `todo/`. If it isn't in `todo/`, it won't be worked.

## Task file format

Filename: `<id>-<slug>.md`, e.g. `t-003-record-income.md`.

```markdown
---
id: t-003                # stable, never renumbered. Global counter: t-001, t-002, ...
title: Record income
status: todo             # backlog | todo | doing | done (mirrors the folder)
type: feature            # feature | bug | refactor | chore | spike | scaffold
created: 2026-05-26
completed:               # YYYY-MM-DD, set by the worker when moved to done/
commit:                  # optional; the canonical link is the [id] tag in the commit message
depends_on: []           # list of task ids that must be in done/ before this can start
files: []                # paths/globs this task is expected to touch — used to avoid
                         #   dispatching two parallel workers onto the same file
tags: []
---

## Why
The user problem or domain pressure behind this. One short paragraph.

## What
What the change is, in domain language (use the glossary in CLAUDE.md).

## Acceptance criteria
- [ ] Concrete, observable outcomes — one bullet each.
- [ ] Money math / budget calc tasks must include a test (see CLAUDE.md money rules).
- [ ] Name the verification level: a test (logic), the service booting + an endpoint
      responding (API), or the screen rendering in a browser via Playwright with no
      console errors (UI). The worker won't mark it done until that level passes.

## Notes
Open questions, sketches, links. Anything a worker would want before starting.
```

## Dependency & parallelism rules

- A task is **ready** when every id in its `depends_on` is in `done/`.
- `/work` runs at most **2** workers at once (override: `/work --max 3`).
- Two ready tasks whose `files` overlap are **not** dispatched in the same wave —
  the lower `id` goes first, the other waits for the next wave. Keep `files`
  honest so this works.
- No cycles. If `/work` detects one, it stops and reports it.

## Conventions

- IDs are global and monotonic: `t-001`, `t-002`, … Look at the highest id across
  **all four folders** to pick the next one. Never reuse or renumber an id.
- One task = one commit, tagged `[<id>]` in the message. Find a task's commit with
  `git log --grep "\[t-003\]"`.
- Keep tasks small enough that a worker can finish one in a single focused pass.
  If it can't, it's a `backlog/` item that needs splitting in `/brainstorm`.
