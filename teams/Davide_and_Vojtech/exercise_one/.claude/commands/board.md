---
description: Read-only status of the task board — counts, the ready set, and what's blocking everything else.
---

# /board

Show the current state of `tasks/`. **Read only — change nothing, commit nothing.**

1. List the four folders: `tasks/backlog/`, `tasks/todo/`, `tasks/doing/`, `tasks/done/`.
2. Read the frontmatter (`id`, `title`, `depends_on`) of everything in `todo/` and `doing/`.
3. A `todo/` task is **ready** when every id in `depends_on` is in `done/`.

Print a compact board:

```
BOARD  (backlog: N  todo: N  doing: N  done: N)

DOING
  t-004  Wire dashboard widget

READY  (no unmet deps — /work can pick these)
  t-002  Income API endpoint
  t-005  Savings goal schema

BLOCKED
  t-003  Income UI form      ← waits on t-002
  t-006  Dashboard net total ← waits on t-002, t-005

BACKLOG  (needs /brainstorm refinement before it can move to todo)
  t-007  Investments — undecided data model
```

Then one line: how many are ready to dispatch right now, and the single most-depended-on
task (the one unblocking the most others) so the user knows what to prioritise refining or
working next. If a dependency cycle exists, call it out explicitly.
