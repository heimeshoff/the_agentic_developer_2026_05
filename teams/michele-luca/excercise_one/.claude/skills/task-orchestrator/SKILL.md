---
name: task-orchestrator
description: >-
  DEPRECATED — do not use. The single-task read→code→QA loop now lives in the
  `task-implementer` agent, and parallel fan-out + serial merge lives in the
  `parallel-tasks` skill. This skill is kept only as a redirect; it referenced a
  non-existent `qa-agent` subagent (the real reviewer is `qa-reviewer`). Use
  `task-implementer` / `parallel-tasks` instead.
---

# task-orchestrator — DEPRECATED

> **Do not invoke this skill.** It has been superseded and is retained only so
> existing references resolve to this notice. It also contained a bug: it told
> the orchestrator to spawn a `qa-agent` subagent that does not exist — the real
> reviewer agent is **`qa-reviewer`**.

## Use these instead

The workflow is now a single backbone: **plan → fan-out → integrate**.

| You want to… | Use |
|---|---|
| Take **one** backlog task end-to-end (claim → Working → dev-skill → Review → `qa-reviewer` → Done → commit on its own branch) | the **`task-implementer`** agent |
| Run **several** independent tasks at once (one git worktree each) and merge the branches serially with `--no-ff` | the **`parallel-tasks`** skill (it spawns `task-implementer` agents) |
| Turn requirements into a parallel-shaped backlog | the **`plan-tasks`** skill (it spawns the `task-planner` agent) |

The implementation loop (`dev-skill`) and the quality gates (`qa-skill`) are
unchanged and are invoked by those agents.

## Why it was removed

- **Duplication.** It re-implemented the single-task loop that `task-implementer`
  already owns — two "orchestrators" meant confusion about which to launch.
- **Broken handoff.** It spawned `qa-agent`, which is not a real subagent type;
  the actual independent reviewer is `qa-reviewer`.
- **No worktree isolation / claim model.** It predates the
  `refs/claims/<TASK-ID>` atomic-claim + per-worktree model that lets multiple
  agents run safely in parallel. `parallel-tasks` + `task-implementer` handle
  that correctly.

> The old driver script `orchestrator.mjs` in this folder is no longer wired
> into the workflow. It is left in place for reference only — nothing invokes it.
